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
        if ( type === 'show' ) {
            win.show();
            return;
        }
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
            return;
        }
        if ( type === 'resize' ) {
            const [window_size] = args;
            console.log('resize event', window_size);
            this.proc.resize(window_size.cols, window_size.rows);
            return;
        }
        if ( type === 'write-clip' ) {
            const { clipboard } = require('electron');
            const [text] = args;
            clipboard.writeText(text, 'clipboard');
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
