const { contextBridge, ipcRenderer } = require('electron');

let on_pty = data => {
    console.log('missed message', data);
};

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('pty', (_event, data) => {
        on_pty(data);
    });
});

contextBridge.exposeInMainWorld('preload', {
    setters: {
        set_on_pty: v => { on_pty = v },
    },
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron,
    },
    message: (...a) => ipcRenderer.invoke('message', ...a),
});
