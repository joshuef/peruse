/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, Tray, BrowserWindow, ipcMain } from 'electron';
import logger from 'logger';
import path from 'path';
import { isRunningUnpacked, isRunningDevelopment, CONFIG } from 'appConstants';

let tray;
let trayWindow;

export const createTray = () =>
{
    tray = new Tray( 'resources/icons/heart.png' );
    tray.on( 'right-click', toggleWindow );
    tray.on( 'double-click', toggleWindow );
    tray.on( 'click', ( event ) =>
    {
        toggleWindow();

        // Show devtools when command clicked
        if ( trayWindow.isVisible() && process.defaultApp && event.metaKey )
        {
            trayWindow.openDevTools( { mode: 'detach' } );
        }
    } );
};

const getWindowPosition = () =>
{
    const trayWindowBounds = trayWindow.getBounds();
    const trayBounds = tray.getBounds();

    // Center trayWindow horizontally below the tray icon
    const x = Math.round( trayBounds.x + ( trayBounds.width / 2 ) - ( trayWindowBounds.width / 2 ) );

    // Position trayWindow 4 pixels vertically below the tray icon
    const y = Math.round( trayBounds.y + trayBounds.height + 4 );

    return { x, y };
};

export const createTrayWindow = () =>
{
    trayWindow = new BrowserWindow( {
        width          : 300,
        height         : 450,
        show           : true, //set to false for release
        frame          : false,
        fullscreenable : false,
        resizable      : false,
        transparent    : true,
        webPreferences : {
            // Prevents renderer process code from not running when trayWindow is
            // hidden
            preload        : path.join( __dirname, 'browserPreload.js'),
            backgroundThrottling : false,
            nodeIntegration: true
        }
    } );
    trayWindow.loadURL( `file://${CONFIG.APP_HTML_PATH}` );

    // Hide the trayWindow when it loses focus
    trayWindow.on( 'blur', () =>
    {
        if ( !trayWindow.webContents.isDevToolsOpened() )
        {
            trayWindow.hide();
        }
    } );


    trayWindow.webContents.on( 'did-finish-load', () =>
    {
        trayWindow.webContents.executeJavaScript( `window.peruseNav('tray')`, ( err, url, result ) =>
        {
            logger.verbose('Tray Window Loaded')
        } );

        logger.info( 'BACKGROUND_PROCESS loaded');

        if( isRunningUnpacked || isRunningDevelopment )
        {
            trayWindow.webContents.openDevTools()
        }
    } );

};

const toggleWindow = () =>
{
    if ( trayWindow.isVisible() )
    {
        trayWindow.hide();
    }
    else
    {
        showWindow();
    }
};

const showWindow = () =>
{
    const position = getWindowPosition();
    trayWindow.setPosition( position.x, position.y, false );
    trayWindow.show();
    trayWindow.focus();
};

ipcMain.on( 'show-trayWindow', () =>
{
    showWindow();
} );
