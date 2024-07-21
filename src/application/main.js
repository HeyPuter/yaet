const {
    app,
    Menu,
    Tray,
    ipcMain,
} = require('electron');
const vhost = require('vhost');
const path_ = require('node:path');

const message_router = (() => {
    return {
    };
})();

const win_registry = {};

const open_window = (data) => {
    console.log('data???', data);
    const { BrowserWindow, BaseWindow, WebContentsView, BrowserView }
        = require('electron');
    // const win = new BaseWindow({ width: 880, height: 600 });
    // const v1 = new WebContentsView();
    // v1.webContents.loadURL('http://et.localhost:1337');
    // win.contentView.addChildView(v1);
    if ( data.type === 'term' ) {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path_.join(__dirname, 'preload.js'),
            }
        });
        setTimeout(() => {
            win.webContents.send('test', 'test message');
        }, 2000);
        console.log('WINDOW ID', win.id, win.webContents.id);
        win_registry[win.webContents.id] = {
            win,
            values: {
                shell: data.shell || process.env.SHELL || '/bin/bash',
                pwd: data.pwd || process.env.HOME,
            }
        };
        win.loadURL('http://term.et.localhost:1337');
        return;
    }
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });
    if ( data.type === 'website' ) {
        win.loadURL(data.url);
        return;
    }
    if ( data.type === 'puter' ) {
        win.loadURL('http://puter.localhost:4100');
        return;
    }

    win.loadURL('http://et.localhost:1337');
    // win.loadFile('assets/about.html');
};

const start_webserver = () => {
    const http = require('http');

    // I really really didn't want to use express;
    // it doesn't really support async error handling
    // and version 5 has been in beta for far too long.
    // Consider its use here temporary.

    const hostname = '127.0.0.1';
    const port = 1337;
    
    const express = require('express');
    // EVERYTHING wants to be called "app"!
    // Please let this convention end immediately!
    const e_app = express();
    
    const e_term = express();
    
    const path_ = require('node:path');
    e_term.use('/', express.static(
        path_.join(__dirname, '../terminal/dist')));

    e_app.use(vhost('term.et.localhost', e_term));
    e_app.use(require('body-parser').json());
    
    e_app.post('/open', (req, res) => {
        open_window(req.body);
        res.json({ status: 'ok' });
    });
    e_app.listen(port);
};

const spawn_program = (winfo, exe) => {
    const pty = require('node-pty');
    const pty_proc = pty.spawn(exe, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: winfo.pwd,
        env: process.env,
    });
    
    winfo.pty_proc = pty_proc;
    
    pty_proc.onData((data) => {
        winfo.win.webContents.send('pty', data);
    });
};

const main = async () => {
    await app.whenReady();
    
    ipcMain.handle('message', (e, ...args) => {
        const winfo = win_registry[e.sender.id];
        if (args[0] === 'values') {
            console.log('CMD->values');
            return winfo.values;
        }
        if (args[0] === 'spawn') {
            const exe = args[1];
            console.log('CMD->spawn: ' + exe);
            spawn_program(winfo, exe);
            return;
        }
        if (args[0] === 'stdin') {
            // console.log('CMD->stdin: ' + args[1]);
            winfo.pty_proc.write(args[1]);
        }
    });
    
    app.on('window-all-closed', () => {
        //
    });

    start_webserver();

    const tray = new Tray('assets/trayicon.png');
    const main_menu = Menu.buildFromTemplate([
        { label: 'Quit', role: 'quit' }
    ]);
    tray.setContextMenu(main_menu);
};
main();
