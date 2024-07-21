const { Base } = require("../lang-util/Base");

class TermWindow extends Base {
    _construct () {
        const { win } = this.options;
        win.on('close', this.on_close.bind(this));
        this.closing_ = false;
    }
    on_message (e, ...args) {
        const { win, values, context } = this.options;

        const type = args.shift();
        if ( type === 'values' ) {
            return values;
        }
        if ( type === 'spawn' ) {
            const [shell] = args;
            const proc = context.processManager.spawn({
                shell,
                cwd: values.pwd,
            });
            this.proc = proc;
            this.on_data_ = data => {
                win.webContents.send('pty', data);
            };
            proc.onData(data => this.on_data_(data));
            proc.on('close', code => {
                if ( this.closing_ ) return;
                this.closing_ = true;
                this.on_data_ = () => {};
                win.close();
            });
            return;
        }
        if ( type === 'stdin' ) {
            if ( ! this.proc ) {
                throw new Error('missing process');
            }
            const [data] = args;
            this.proc.write(data);
        }
    }
    on_close () {
        if ( this.closing_ ) return;
        this.closing_ = true;
        this.on_data_ = () => {};
        this.proc.kill('SIGHUP');
    }
}

module.exports = { TermWindow };
