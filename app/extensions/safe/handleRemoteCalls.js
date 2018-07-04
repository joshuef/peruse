import * as theAuthApi from 'extensions/safe/auth-api/authFuncs';
import { callIPC, setAuthCallbacks } from 'extensions/safe/ffi/ipc';
import * as authActions from 'extensions/safe/actions/authenticator_actions';
import * as uiActions from 'actions/ui_actions';
import { SAFE } from 'extensions/safe/constants';
import CONSTANTS from 'extensions/safe/auth-constants';
import * as peruseAppActions from 'extensions/safe/actions/peruse_actions';
import * as remoteCallActions from 'actions/remoteCall_actions';

import logger from 'logger';

let theStore;

export const handleRemoteCalls = ( store, allAPICalls, theCall ) =>
{
    theStore = store;

    logger.verbose('Handling remote call in extension', theCall)
    if ( theCall && theCall.isListener )
    {
        // register listener with auth
        allAPICalls[theCall.name]( ( error, args ) =>
        {
            if ( theCall.name === 'setNetworkListener' )
            {
                store.dispatch( authActions.setAuthNetworkStatus( args ) );

                const authenticatorHandle = allAPICalls.getAuthenticatorHandle();
                store.dispatch( authActions.setAuthHandle( authenticatorHandle ) );
            }

            store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, done: true, response: args } ) );

        } );
    }
}


export const remoteCallApis =  {
    ...theAuthApi,
    login : async( secret, password ) =>
    {
        await theAuthApi.login( secret, password );
        theStore.dispatch( peruseAppActions.setNetworkStatus(SAFE.NETWORK_STATE.LOGGED_IN) );
    },
    logout : async( secret, password ) =>
    {
        await theAuthApi.logout( );
        theStore.dispatch( peruseAppActions.setNetworkStatus(SAFE.NETWORK_STATE.CONNECTED) );
    },
    /**
    * Handle auth URI calls from webview processes. Should take an authURI, decode, handle auth and reply
    * with auth respnose.
    * @type {[type]}
    */
    authenticateFromUriObject : async ( authUriObject ) =>
    {
        logger.silly( 'Authenticating a webapp via remote call.');

        return new Promise( ( resolve, reject ) =>
        {
            setAuthCallbacks( authUriObject, resolve, reject );
            callIPC.enqueueRequest( authUriObject, CONSTANTS.CLIENT_TYPES.WEB );
        });
    }
}
