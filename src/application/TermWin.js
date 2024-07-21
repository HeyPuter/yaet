const { Base } = require("../lang-util/Base");

class TermWin extends Base {
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
            proc.onData(data => {
                win.webContents.send('pty', data);
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
}

module.exports = { TermWin };
