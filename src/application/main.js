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
const { ANY } = require('any-config');

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
        win.loadFile('static/terminal/index.html');
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

const main = async () => {
    app.setName('yaet');
    
    let config = {};
    (() => {
        const fs = require('fs');
        const path_ = require('path');

        const config_dir = app.getPath('userData');
        app.setPath('userData', path_.join(config_dir, 'electron_stuff'));

        fs.mkdirSync(config_dir, { recursive: true });
        
        let found_config;
        const names = ANY.explode_name('config', ['parse']);
        for ( const name of names ) {
            const possible_config_path = path_.join(config_dir, name);
            if ( fs.existsSync(possible_config_path) ) {
                found_config = possible_config_path;
            }
        }
        
        if ( ! found_config ) {
            console.log(`no configuration found in ${config_dir}`);
            return;
        }
        
        console.log(`loading config: ${found_config}`);
        const data = fs.readFileSync(found_config);
        config = ANY.parse(path_.extname(found_config), data);
    })();
    
    context.config = config;
    
    if ( config.single_instance ) {
        const first = app.requestSingleInstanceLock();
        if ( ! first ) {
            app.quit();
            return;
        }
    }
        
    await app.whenReady();
    
    ipcMain.handle('message', (e, ...args) => {
        const window = context.windowManager.get(e.sender.id);
        return window.on_message(e, ...args);
    });
    
    // app.on('window-all-closed', () => {
    //     // NOOP: prevent default exit behavior
    // });
    
    if ( config.single_instance ) {
        app.on('second-instance', (
            event, commandLine, workingDirectory,
            additionalData,
        ) => {
            open_window({
                type: 'term',
                shell: process.env.SHELL || '/bin/bash',
                pwd: workingDirectory,
            });
        });
    }

    open_window({
        type: 'term',
        shell: process.env.SHELL || '/bin/bash',
        pwd: process.cwd(),
    });

    if ( ! config.no_tray ) {
        const tray = new Tray('assets/trayicon.png');
        const main_menu = Menu.buildFromTemplate([
            { label: 'Quit', role: 'quit' }
        ]);
        tray.setContextMenu(main_menu);
    }
};

main();
