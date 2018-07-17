import logger from 'logger';
import * as authenticatorActions from 'extensions/safe/actions/authenticator_actions';

import * as peruseAppActions from 'extensions/safe/actions/peruse_actions';
import { initAnon } from 'extensions/safe/network';
import { getLibStatus } from 'extensions/safe/auth-api/authFuncs';

import * as ffiLoader from './auth-api/ffiLoader';

import { parse as parseURL } from 'url';
import setupRoutes from './server-routes';
import registerSafeProtocol from './protocols/safe';
import registerSafeAuthProtocol from './protocols/safe-auth';
import blockNonSAFERequests from './blockNonSafeReqs';

import { setIsMock } from 'extensions/safe/actions/peruse_actions';
import { startedRunningMock, isRunningSpectronTestProcess } from 'appConstants';
import handlePeruseStoreChanges from './peruseSafeApp';

import { setIPCStore } from 'extensions/safe/ffi/ipc';
import sysUri from 'extensions/safe/ffi/sys_uri';
import { APP_INFO, PROTOCOLS } from 'appConstants';
import { addTab } from 'actions/tabs_actions';

import safeReducers from 'extensions/safe/reducers';
import webviewPreload from 'extensions/safe/webviewPreload';
import { handleRemoteCalls, remoteCallApis } from 'extensions/safe/handleRemoteCalls';
import * as PeruseActions from 'extensions/safe/actions/peruse_actions';

import { addFileMenus } from 'extensions/safe/menus';
import { urlIsAllowedBySafe as urlIsValid } from 'extensions/safe/utils/safeHelpers';

const onWebviewPreload = ( store ) =>
{
    return webviewPreload( store )
}


const preAppLoad = () =>
{

}

/**
 * Adds menu items to the main peruse menus.
 * @param  {Object} store redux store
 * @param {Array} menusArray Array of menu objects to be parsed by electron.
 */
const addExtensionMenuItems = ( store, menusArray ) =>
{
    logger.verbose( 'Adding SAFE menus to browser' );

    const newMenuArray = [];

    menusArray.forEach( menu => {
        const label = menu.label;
        let newMenu = menu;

        if( label == 'File' )
        {
            newMenu = addFileMenus( store, newMenu );
        }

        newMenuArray.push(newMenu);

    })

    return newMenuArray;
}

const addReducersToPeruse = ( ) =>
{
    return safeReducers;
}

/**
 * Triggered when a remote call is received in the main process
 * @param  {Object} store redux store
 * @param  {Object} allAPICalls object containing all api calls available in main (for use via store remoteCalls)
 * @param  {[type]} theCall     call object with id, and info
 */
const onRemoteCallInMain = ( store, allAPICalls, theCall ) => handleRemoteCalls(store, allAPICalls, theCall);

const getRemoteCallApis = () => remoteCallApis;

/**
 * add actions to the peruse browser container
 * @type {Object}
 */
const actionsForBrowser = {
    ...PeruseActions
};


const onInitBgProcess = async ( store ) =>
{
    logger.info( 'Registering SAFE Network Protocols' );
    try
    {
        registerSafeProtocol( store );
        registerSafeAuthProtocol( store );
        blockNonSAFERequests();
        setIPCStore(store);
    }
    catch ( e )
    {
        logger.error( 'Load extensions error: ', e );
    }

    //load the auth/safe libs
    ffiLoader.loadLibrary( startedRunningMock );

    let prevAuthLibStatus;

    store.subscribe( () =>
    {
        const authLibStatus = getLibStatus();

        if ( authLibStatus && authLibStatus !== prevAuthLibStatus )
        {
            logger.verbose( 'Authenticator lib status: ', authLibStatus );
            prevAuthLibStatus = authLibStatus;
            store.dispatch( authenticatorActions.setAuthLibStatus( authLibStatus ) );
            initAnon( store );
        }

        handlePeruseStoreChanges( store );
    });

    const mainAppInfo = APP_INFO.info;
    const authAppInfo = {
        ...mainAppInfo,
        id     : 'net.maidsafe.app.browser.authenticator',
        name   : 'SAFE Browser Authenticator',
        icon   : 'iconPath'
    }

    logger.verbose( 'Auth application info', authAppInfo );
    sysUri.registerUriScheme( authAppInfo, PROTOCOLS.SAFE_AUTH );
};

/**
 * on open of peruse application
 * @param  {Object} store redux store
 */
const onOpen = ( store ) =>
{
    logger.verbose('OnOpen: Setting mock in store. ', startedRunningMock)
    store.dispatch( setIsMock( startedRunningMock ) );
}


/**
 * Add middleware to Peruse redux store
 * @param  {Object} store redux store
 */
const middleware = store => next => action =>
{
    if( isRunningSpectronTestProcess )
    {
        logger.info( 'ACTION:', action );
    }

    return next( action );
};



const parseSafeUri = function ( uri )
{
    logger.verbose('Parsing safe uri', uri);
    return uri.replace( '//', '' ).replace( '==/', '==' );
};

/**
 * Trigger when receiving a URL param in the browser.
 * @param  {Object} store redux store
 * @param  {String} url   url param
 */
const onReceiveUrl = ( store, url ) =>
{
    const preParseUrl = parseSafeUri( url );
    const parsedUrl = parseURL( preParseUrl );

    // TODO. Queue incase of not started.
    logger.verbose( 'Receiving Open Window Param (a url)', url );

    // When we have more... What then? Are we able to retrieve the url schemes registered for a given app?
    if ( parsedUrl.protocol === 'safe-auth:' )
    {
        store.dispatch( authenticatorActions.handleAuthUrl( url ) );
    }
    if ( parsedUrl.protocol === 'safe:' )
    {
        store.dispatch( addTab( { url, isActiveTab: true } ) );
    }
    // 20 is arbitrarily looong right now...
    else if ( parsedUrl.protocol && parsedUrl.protocol.startsWith( 'safe-' ) && parsedUrl.protocol.length > 20 )
    {
        store.dispatch( peruseAppActions.receivedAuthResponse( url ) );
    }


    if ( process.platform === 'darwin' && global.macAllWindowsClosed )
    {
        if ( url.startsWith( 'safe-' ) )
        {
            openWindow( store );
        }
    }
};


export default {
    addExtensionMenuItems,
    getRemoteCallApis,
    actionsForBrowser,
    addReducersToPeruse,
    getRemoteCallApis,
    onInitBgProcess,
    onReceiveUrl,
    onRemoteCallInMain,
    onOpen,
    onWebviewPreload,
    preAppLoad,
    setupRoutes,
    middleware,
    urlIsValid
};
