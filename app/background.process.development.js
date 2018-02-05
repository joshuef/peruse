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
// import { remote } from 'electron';
import logger from 'logger';
// import { isRunningUnpacked, isRunningPackaged, PROTOCOLS } from 'appConstants';
// import { parse as parseURL } from 'url';
// import pkg from 'appPackage';

import { configureStore } from 'store/configureStore';

// const { Menu, Tray } = remote;
// const app = remote.require('app');
const initialState = {};

// Add middleware from extensions here.
const loadMiddlewarePackages = [];
const store = configureStore( initialState, loadMiddlewarePackages );


logger.info('BG PROCESSSS PAGGE LOADEDED', store.getState());


// let tray = null;
