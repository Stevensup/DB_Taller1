// Autor: [Tu Nombre]
// Fecha: [Fecha Actual]
// Descripción: Código principal de una aplicación Electron con dos ventanas (principal y "About"),
//              un menú básico y eventos asociados al estado de la alimentación del dispositivo.

const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;
const path = require('path');
const url = require('url');

// Plantilla del menú de la aplicación.
const menuTemplate = [
  {
    label: 'Application',
    submenu: [
      {
        label: 'About',
        click: () => {
          openAboutWindow();
        }
      }
    ]
  }
];

let mainWindow;

/**
 * Crea y muestra la ventana principal de la aplicación.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720
  });

  // Carga el archivo index.html en la ventana principal.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Construye el menú a partir de la plantilla y lo asigna a la ventana principal.
  const menu = Menu.buildFromTemplate(menuTemplate);
  mainWindow.setMenu(menu);

  // Maneja el evento cuando la ventana principal es cerrada.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Abre y muestra la ventana "About".
 */
function openAboutWindow() {
  let aboutWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    width: 400,
    height: 200
  });

  // Carga el archivo about.html en la ventana "About".
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'about.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Desactiva el menú en la ventana "About".
  aboutWindow.setMenu(null);

  // Muestra la ventana "About" cuando esté lista para mostrarse.
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });
}

// Evento cuando la aplicación está lista.
app.on('ready', () => {
  createWindow();

  // Escucha eventos del monitor de alimentación y realiza acciones en consecuencia.
  electron.powerMonitor.on('on-ac', () => {
    mainWindow.restore();
  });

  electron.powerMonitor.on('on-battery', () => {
    mainWindow.minimize();
  });
});

// Evento cuando se cierran todas las ventanas de la aplicación.
app.on('window-all-closed', () => {
  // Sale de la aplicación si no está en el sistema operativo macOS.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Evento cuando la aplicación se activa.
app.on('activate', () => {
  // Crea una nueva ventana principal si no hay ninguna.
  if (mainWindow === null) {
    createWindow();
  }
});
