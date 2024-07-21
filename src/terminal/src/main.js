import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

window.on_pty = () => {};

const term = new Terminal({});

document.addEventListener('DOMContentLoaded', async () => {
    const el_terminal = document.createElement('div');
    document.body.appendChild(el_terminal);
    el_terminal.id = 'terminal';
    term.open(document.getElementById('terminal'));
    const fit = new FitAddon();
    term.loadAddon(fit);
    fit.fit();
    const observer = new ResizeObserver(() => {
        fit.fit();
    });
    observer.observe(el_terminal);
    
    if ( globalThis.preload ) {
        const vals = await globalThis.preload.message('values');
        for ( const k in vals ) {
            term.write(`${k}: ${vals[k]}\r\n`);
        }
        for ( const name in preload.versions ) {
            term.write(`${name}: ${preload.versions[name]()}\r\n`);
        }
        preload.setters.set_on_pty(data => term.write(data));
        preload.message('spawn', vals.shell);
        term.onData(data => {
            preload.message('stdin', data);
        })
    }
});
