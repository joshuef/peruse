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
import { BrowserWindow } from 'electron';
import logger from 'logger';
import path from 'path';
import { isRunningUnpacked, isRunningDevelopment, isRunningPackaged, PROTOCOLS } from 'appConstants';
// import { parse as parseURL } from 'url';
// import pkg from 'appPackage';
// import { configureStore } from './store/configureStore';

// const initialState = {};
let backgroundProcess = null;

const BACKGROUND_PROCESS = path.join( __dirname, 'bg.html' );

// Add middleware from extensions here.
// const loadMiddlewarePackages = [];
// const store = configureStore( initialState, loadMiddlewarePackages );

// const mainWindow = null;



const setupBackground = () =>
{
    logger.info( 'Setting up Background Process', backgroundProcess );

    if ( backgroundProcess === null )
    {
        logger.info('loading:', BACKGROUND_PROCESS );

        backgroundProcess = new BrowserWindow( {
            // show           : isRunningUnpacked,
            width: 300,
            height: 450,
            show: false,
            frame: false,
            fullscreenable: false,
            resizable: false,
            transparent: true,
            webPreferences : {
                // partition               : 'persist:safe-tab', // TODO make safe,
                nodeIntegration         : true,
                // Prevents renderer process code from not running when window is
                // hidden
                backgroundThrottling: false
                // nodeIntegrationInWorker : true // testing if this is useful
            }
        } );

        // Hide the window when it loses focus
        backgroundProcess.on('blur', () => {
          if (!backgroundProcess.webContents.isDevToolsOpened()) {
            backgroundProcess.hide()
          }
        })

        backgroundProcess.webContents.on( 'did-finish-load', () =>
        {
            logger.info( 'BACKGROUND_PROCESS loaded');

            if( isRunningPackaged || isRunningDevelopment )
            {
                backgroundProcess.webContents.openDevTools()
            }
            // runScript( backgroundProcess, debug, script, cb );
        } );

        backgroundProcess.loadURL( `file://${BACKGROUND_PROCESS}` );
        // backgroundProcess.webContents.openDevTools()
    }

    // openWindow( store );
    // loadExtensions( server, store );

    // setupWebAPIs();

    // ( store );
    return backgroundProcess;
};

export default setupBackground;
