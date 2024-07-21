const {
    app,
    Menu,
    Tray,
    ipcMain,
} = require('electron');

const vhost = require('vhost');
const path_ = require('node:path');
const { WinManager } = require('./WinManager');
const { ProcessManager } = require('./ProcessManager');
const { TermWindow } = require('./TermWindow');

let context = {};
context.processManager = ProcessManager.create({ context });
context.windowManager = WinManager.create({ context });

const open_window = (data) => {
    const { BrowserWindow } = require('electron');

    if ( data.type === 'term' ) {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            backgroundColor: '#000000',
            transparent: true,
            webPreferences: {
                preload: path_.join(__dirname, 'preload.js'),
            }
        });
        
        win.menuBarVisible = false;

        const window = TermWindow.create({
            context,
            win,
            values: {
                shell: data.shell || process.env.SHELL || '/bin/bash',
                pwd: data.pwd || process.env.HOME,
            }
        });
        context.windowManager.register(win.webContents.id, window);
        
        win.loadURL('http://term.et.localhost:1337');
        return;
    }
    if ( data.type === 'website' ) {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
        });

        win.loadURL(data.url);
        return;
    }
};

const start_webserver = () => {
    const port = 1337;
    
    const express = require('express');

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

const main = async () => {
    await app.whenReady();
    
    ipcMain.handle('message', (e, ...args) => {
        const window = context.windowManager.get(e.sender.id);
        return window.on_message(e, ...args);
    });
    
    app.on('window-all-closed', () => {
        // NOOP: prevent default exit behavior
    });

    start_webserver();

    const tray = new Tray('assets/trayicon.png');
    const main_menu = Menu.buildFromTemplate([
        { label: 'Quit', role: 'quit' }
    ]);
    tray.setContextMenu(main_menu);
};

main();
