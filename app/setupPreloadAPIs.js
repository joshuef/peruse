import pkg from 'appPackage';
import logger from 'logger';
import * as remoteCallActions from 'actions/remoteCall_actions';
import safe from '@maidsafe/safe-node-app';
import { PROTOCOLS } from 'appConstants';

import { manifest as authManifest } from 'extensions/safe/auth-api/manifest';

const VERSION = pkg.version;
const pendingCalls = {};

window.eval = global.eval = () =>
{
    throw new Error( 'Sorry, peruse does not support window.eval().' );
};

const setupSafeAPIs = ( store ) =>
{
    logger.info( 'Setup up SAFE Dom API via @maidsafe/safe-node-app' );
    window.safe = { ...safe };

    window.safe.initializeApp = async ( appInfo, netStateCallback, options ) =>
    {
        // TODO: Throw warnings for these options.
        const optionsToUse = {
            ...options,
            registerScheme : false,
            joinSchemes    : false,
            libPath        : null,
            configPath     : null
        };

        let app = await safe.initializeApp( appInfo, netStateCallback, optionsToUse );

        app.auth.openUri = () =>
        {
            logger.warn('This function is not accessible in the Browser DOM. Please check the docs:')
        };

        return app;
    };

    window.safe.fromAuthUri = async ( appInfo, authUri, netStateCallback, options ) =>
    {
        // TODO: Throw warnings for these options.
        const optionsToUse = {
            ...options,
            registerScheme : false,
            joinSchemes    : false,
            libPath        : null,
            configPath     : null
        };

        let app = await window.safe.initializeApp( appInfo, netStateCallback, optionsToUse );

        await app.auth.loginFromURI( authURI );
        return app;
    };

    /**
     * Authorise an app via the browser, returns a promise resolving to a URI string.
     * @param  {[type]}  authUri [description]
     * @return {Promise}         resolves to URI string.
     */
    window.safe.authorise = async ( authUri ) =>
    {
        if( !authUri || typeof authUri !== 'string' ) throw new Error('AuthUri string is required') return;

        return await createRemoteCall( 'authenticateFromURI', store )( authUri );
    };
};

const setupPreloadedSafeAuthAPIs = ( store ) =>
{
    setupSafeAPIs( store );
    window[pkg.name] = { version: VERSION };

    // TODO: Abstract into extension.


    if ( !window.location.protocol === PROTOCOLS.SAFE_AUTH )
    {
        return;
    }

    window.safeAuthenticator = {};
    const safeAppGroupId = ( Math.random() * 1000 | 0 ) + Date.now();
    window.safeAppGroupId = safeAppGroupId;

    authManifest.forEach( ( func ) =>
    {
        window.safeAuthenticator[func] = createRemoteCall( func, store );
    } );

    window.safeAuthenticator.getNetworkState = ( ) =>
    {
        const state = store.getState();
        logger.info( 'getting the network state!', state.authenticator.networkState );
        return { state: state.authenticator.networkState };
    };

    window.safeAuthenticator.getAuthenticatorHandle = ( ) =>
    {
        logger.info( 'window method for get auth handle being called' );
        const state = store.getState();
        return state.authenticator.authenticatorHandle;
    };

    window.safeAuthenticator.getLibStatus = ( ) =>
    {
        const state = store.getState();
        return state.authenticator.libStatus;
    };

    window.safeAuthenticator.setReAuthoriseState = ( ) =>
    {
        // TODO: Reauth action
        // const state = store.getState();
        // return state.authenticator.authenticatorHandle;

    };


    // Add custom and continual listeners.
    window.safeAuthenticator.setNetworkListener = ( cb ) =>
    {
        const callId = Math.random().toString( 36 );

        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setNetworkListener',
                isListener : true
            }
        ) );

        pendingCalls[callId] = {
            resolve : cb
        };
    };

    window.safeAuthenticator.setAppListUpdateListener = ( cb ) =>
    {
        const callId = Math.random().toString( 36 );

        store.dispatch( remoteCallActions.addRemoteCall(
            {
                id         : callId,
                name       : 'setAppListUpdateListener',
                isListener : true
            }
        ) );

        pendingCalls[callId] = {
            resolve : cb
        };
    };


    store.subscribe( async () =>
    {
        const state = store.getState();
        const calls = state.remoteCalls;

        calls.forEach( theCall =>
        {
            if ( theCall === pendingCalls[theCall.id] )
            {
                return;
            }

            const callPromises = pendingCalls[theCall.id];

            if ( !callPromises )
            {
                return;
            }

            if ( theCall.done && callPromises.resolve )
            {
                pendingCalls[theCall.id] = theCall;

                let callbackArgs = theCall.response;

                callbackArgs = [theCall.response];

                if ( theCall.isListener )
                {
                    // error first
                    callPromises.resolve( null, ...callbackArgs );
                }
                callPromises.resolve( ...callbackArgs );
                store.dispatch( remoteCallActions.removeRemoteCall(
                    theCall
                ) );

                delete pendingCalls[theCall.id];
            }
            else if ( theCall.error && callPromises.reject )
            {
                pendingCalls[theCall.id] = theCall;

                logger.error( 'remoteCall ', theCall.name, 'was rejected with: ', theCall.error );
                callPromises.reject( new Error( theCall.error.message || theCall.error ) );
                store.dispatch( remoteCallActions.removeRemoteCall(
                    theCall
                ) );
                delete pendingCalls[theCall.id];
            }
        } );
    } );
};

const createRemoteCall = ( functionName, store ) =>
{
    if ( !functionName )
    {
        throw new Error( 'Remote calls must have a functionName to call.' );
    }

    const remoteCall = ( ...args ) => new Promise( ( resolve, reject ) =>
    {
        const callId = Math.random().toString( 36 );

        const theCall = {
            id   : callId,
            name : functionName,
            args
        };

        store.dispatch( remoteCallActions.addRemoteCall( theCall ) );

        pendingCalls[theCall.id] = {
            resolve, reject
        };
    } );

    return remoteCall;
};
export default setupPreloadedSafeAuthAPIs;
