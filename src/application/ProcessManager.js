const { Base } = require("../lang-util/Base");

class ProcessManager extends Base {
    _construct () {
        this.processes = [];
    }
    spawn ({ shell, cwd }) {
        const pty = require('node-pty');
        const pty_proc = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd,
            env: process.env,
        });
        
        this.processes.push({
            pty_proc,
        });
        
        return pty_proc;
    }
}

module.exports = {
    ProcessManager,
};
