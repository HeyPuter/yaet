import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { ImageAddon } from '@xterm/addon-image';
import { WebviewAddon } from 'xterm-addon-webview';
import { WebLinksAddon } from '@xterm/addon-web-links';
import XtermWebFont from 'xterm-webfont';
// import { LigaturesAddon } from '@xterm/addon-ligatures';

window.on_pty = () => {};

const term = new Terminal({
    // allowProposedApi: true,
});

document.addEventListener('DOMContentLoaded', async () => {
    const el_terminal = document.createElement('div');
    document.body.appendChild(el_terminal);
    el_terminal.id = 'terminal';
    window.term = term;
    
    // term.loadAddon(new XtermWebFont());
    // term.loadWebfontAndOpen(document.getElementById('terminal'));
    term.open(document.getElementById('terminal'));

    const fit = new FitAddon();
    term.loadAddon(fit);
    fit.fit();
    const observer = new ResizeObserver(() => {
        fit.fit();
    });
    observer.observe(el_terminal);
    
    // TODO: put behind config parameter
    // const webgl = new WebglAddon();
    // term.loadAddon(webgl);

    const imageAddon = new ImageAddon();
    term.loadAddon(imageAddon);
    
    const postmessage_api = {
        ['write-stdin']: ({ text }) => {
            // only accept ascii characters to avoid security minefield
            text = text.replace(/[^\x20-\x7E]/g, '');
            const escaped = `\x1B]21337;${text}\x1B\\`;
            preload.message('stdin', escaped);
        }
    };
    
    term.loadAddon(new WebviewAddon({
        on_iframe_create: ({ entry }) => {
            const { api_safe, iframe } = entry;
            if ( ! api_safe ) return;
            const fn = event => {
                if ( event.source !== iframe.contentWindow ) return;
                const data = event.data;
                if ( ! data.command ) {
                    return;
                }
                if ( ! postmessage_api.hasOwnProperty(data.command) ) {
                    return;
                }
                postmessage_api[data.command](data);
            };
            entry.listener = fn;
            window.addEventListener('message', fn);
        },
        on_iframe_detach: ({ entry }) => {
            if ( entry.listener ) {
                window.removeEventListener('message', entry.listener);
            }
            delete entry.listener;
            entry.iframe.style.opacity = '0.8';
        }
    }));
    
    // This isn't really working
    // const ligaturesAddon = new LigaturesAddon();
    // term.loadAddon(ligaturesAddon);
    
    // Need to override default electron behavior
    // const weblinksAddon = new WebLinksAddon();
    // term.loadAddon(weblinksAddon);
    
    // This doesn't seem to do what I thought it does
    // const clipboardAddon = new ClipboardAddon();
    // term.loadAddon(clipboardAddon);
    
    if ( globalThis.preload ) {
        preload.message('show');
        const config = await globalThis.preload.message('config');
        const vals = await globalThis.preload.message('values');
        const versions = [];
        for ( const name in preload.versions ) {
            versions.push(`${preload.versions[name]()}`);
        }
        if ( ! config.no_version ) {
            term.write(
                `\x1B[36;1mYAET\x1B[0m ` +
                `\x1B[2;37m(${versions.join(',')})\x1B[0m\r\n`);
        }
        preload.setters.set_on_pty(data => term.write(data));
        preload.message('spawn', vals.shell);
        term.onData(data => {
            preload.message('stdin', data);
        })
        preload.message('resize', {
            cols: term.cols,
            rows: term.rows,
        });
        term.onResize(evt => {
            preload.message('resize', evt);
        });
        term.focus();
        
        term.attachCustomKeyEventHandler(evt => {
            if (
                evt.type === 'keydown' &&
                evt.code == 'KeyC' &&
                evt.ctrlKey && evt.shiftKey
            ) {
                const data = term.getSelection();
                preload.message('write-clip', data);
            }
            // if ( evt.code == 'KeyV' && evt.ctrlKey && evt.shiftKey ) {
            //     const data = preload.message('read-clip');
            //     term.write(data);
            // }
        })
    }
});
