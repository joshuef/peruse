import { createActions } from 'redux-actions';
import { createAliasedAction } from 'electron-redux';
import { callIPC } from 'extensions/safe/ffi/ipc';
import AUTH_CONSTANTS from 'extensions/safe/auth-constants';

import logger from 'logger';

export const TYPES = {
    SET_AUTH_LIB_STATUS     : 'SET_AUTH_LIB_STATUS',
    SET_AUTH_HANDLE         : 'SET_AUTH_HANDLE',
    SET_AUTH_NETWORK_STATUS : 'SET_AUTH_NETWORK_STATUS',
    ADD_AUTH_REQUEST        : 'ADD_AUTH_REQUEST',
    REMOVE_AUTH_REQUEST     : 'REMOVE_AUTH_REQUEST',
    HANDLE_AUTH_URL         : 'HANDLE_AUTH_URL',
};

export const {
    setAuthLibStatus,
    setAuthHandle,
    setAuthNetworkStatus,
    addAuthRequest,
    removeAuthRequest

} = createActions(
    TYPES.SET_AUTH_LIB_STATUS,
    TYPES.SET_AUTH_HANDLE,
    TYPES.SET_AUTH_NETWORK_STATUS,
    TYPES.ADD_AUTH_REQUEST,
    TYPES.REMOVE_AUTH_REQUEST,
);

const triggerAuthDecoding = ( reqObject ) =>
{
    logger.verbose('Triggerin auth URL decode', reqObject)
    callIPC.enqueueRequest( reqObject );
};

export const handleAuthUrl = createAliasedAction ? createAliasedAction(
    TYPES.HANDLE_AUTH_URL,
    ( reqObject ) => (
        {
        // the real action
            type    : TYPES.HANDLE_AUTH_URL,
            payload : triggerAuthDecoding( reqObject ),
        } ),
) : ( reqObject ) => (
    {
        type    : TYPES.HANDLE_AUTH_URL,
        payload : triggerAuthDecoding( reqObject ),
    } );
