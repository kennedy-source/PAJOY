const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pajoy', {
  backup: () => ipcRenderer.invoke('pajoy:backup'),
  restore: () => ipcRenderer.invoke('pajoy:restore'),
  printReceipt: (html) => ipcRenderer.invoke('pajoy:print-receipt', html),
  apiBase: process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:5179'
});
