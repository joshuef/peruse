/* eslint-disable no-underscore-dangle */
import { shell } from 'electron';
import { getPeruseAuthReqUri, authFromInternalResponse } from '../network';
import * as peruseAppActions from 'extensions/safe/actions/peruse_actions';
import * as notificationActions from 'actions/notification_actions';
import i18n from 'i18n';
import authenticator from './authenticator';
import CONSTANTS from '../auth-constants';
import logger from 'logger';
import { addAuthNotification } from '../manageAuthNotifications';
import errConst from '../err-constants';

let store;
const ipcEvent = null;


export const CLIENT_TYPES = {
    DESKTOP : 'DESKTOP',
    WEB     : 'WEB'
};

export const REQ_TYPES = {
    AUTH      : 'AUTH',
    CONTAINER : 'CONTAINER',
    MDATA     : 'MDATA'
};

const allAuthCallBacks = {};


export const setIPCStore = ( passedStore ) =>
{
    store = passedStore;
};


/**
 * Set promise callbacks to be retrievable after authentication handling.
 * @param {[type]} req     [description]
 * @param {[type]} resolve [description]
 * @param {[type]} reject  [description]
 */
export const setAuthCallbacks = ( req, resolve, reject ) =>
{
    allAuthCallBacks[req.id] = {
        resolve, reject
    };
};

const parseResUrl = ( url ) =>
{
    const split = url.split( ':' );
    split[0] = split[0].toLocaleLowerCase().replace( '==', '' );
    return split.join( ':' );
};

const openExternal = ( uri ) =>
{
    if ( !uri || ( uri.indexOf( 'safe' ) !== 0 ) || reqQ.req.type !== CONSTANTS.CLIENT_TYPES.DESKTOP )
    {
        return;
    }
    try
    {
        shell.openExternal( parseResUrl( uri ) );
    }
    catch ( err )
    {
        logger.error( err.message );
    }
};

async function sendAuthDecision( isAllowed, authReqData, reqType )
{
    logger.verbose( 'IPC.js: Sending auth response', isAllowed, authReqData );
    if ( reqType === REQ_TYPES.AUTH )
    {
        onAuthDecision( authReqData, isAllowed );
    }
    else if ( reqType === REQ_TYPES.CONTAINER )
    {
        onContainerDecision( authReqData, isAllowed );
    } else {
      onSharedMDataDecision( authReqData, isAllowed );
    }
}


class Request
{
    constructor( req )
    {
        this.id = req.id;
        this.uri = req.uri;
        this.isUnRegistered = req.isUnRegistered;
        this.type = CONSTANTS.CLIENT_TYPES[req.type];
        this.error = null;
        this.res = null;
    }
}

class ReqQueue
{
    constructor( resChannelName, errChannelName )
    {
        this.q = [];
        this.processing = false;
        this.req = null;
        this.resChannelName = resChannelName;
        this.errChannelName = errChannelName;
    }

    add( req )
    {
        if ( !( req instanceof Request ) )
        {
            this.next();
            return;
        }
        this.q.push( req );
        this.process();
    }

    next()
    {
        this.processing = false;
        if ( this.q.length === 0 )
        {
            return;
        }
        this.q.shift();
        this.process();
    }

    process()
    {
        const self = this;
        if ( this.processing || this.q.length === 0 )
        {
            return;
        }
        this.processing = true;
        this.req = this.q[0];

        authenticator.decodeRequest( this.req.uri ).then( ( res ) =>
        {
            if ( !res )
            {
                return;
            }

            this.req.res = res;

            logger.info( 'IPC.js: another response being parsed.:', res );
            if ( res.authReq || res.contReq || res.mDataReq )
            {
                logger.info( 'Its an auth request!' );
                let reqType = 'authReq';
                if (res.contReq) {
                  reqType = 'contReq';
                }
                if (res.mDataReq) {
                  reqType = 'mDataReq';
                }

                const app = res[reqType].app;
                addAuthNotification( res, app, sendAuthDecision, store );
                return;
            }


            // if ( ipcEvent )
            // {
            //     ipcEvent.sender.send( self.resChannelName, self.req );
            // }

            // TODO. Use openUri and parse received url once decoded to decide app
            // OR: upgrade connection
            if ( this.req.uri === getPeruseAuthReqUri() )
            {
                authFromInternalResponse( parseResUrl( res ) );
            }
            else
            {
                openExternal( res );
            }

            self.next();
        } ).catch( ( err ) =>
        {
            // FIXME: if error occurs for unregistered client process next
            self.req.error = err.message;
            // TODO/BOOKMARK: leaving off here. share MData req URI is causing error when used to call auth_decode_ipc_msg in authenticator.js
            logger.error( 'Error at req processing for:', this.req );

            // TODO: Setup proper rejection from when unauthed.
            if ( store )
            {
                store.dispatch( peruseAppActions.receivedAuthResponse( err.message ) );
            }

            if ( ipcEvent )
            {
                ipcEvent.sender.send( self.errChannelName, self.req );
            }

            else
            {
                // TODO: Currently there is no message sent when unauthorised.
                // We need to send one for the app to know...
                // authenticator.encodeAuthResp( this.req, false )
            }
        } );
    }
}

const reqQ = new ReqQueue( 'onAuthDecisionRes', 'onAuthResError' );
const unregisteredReqQ = new ReqQueue( 'onUnAuthDecisionRes', 'onUnAuthResError' );

const registerNetworkListener = ( e ) =>
{
    authenticator.setListener( CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, ( err, state ) =>
    {
        if ( state === CONSTANTS.NETWORK_STATUS.CONNECTED )
        {
            reqQ.processing = false;
            reqQ.process();
        }
        e.sender.send( 'onNetworkStatus', state );
    } );
};

const enqueueRequest = ( req, type ) =>
{
    if( !req ) throw new Error( 'The req object is missing' );

    const isUnRegistered = req.isUnRegistered;
    const request = new Request( {
        id  : req.id,
        uri : req.uri ? req.uri : req,
        type: type || CONSTANTS.CLIENT_TYPES.DESKTOP,
        isUnRegistered
    } );


    if ( isUnRegistered )
    {
        unregisteredReqQ.add( request );
    }
    else
    {
        reqQ.add( request );
    }
};

const onAuthReq = ( e ) =>
{
    authenticator.setListener( CONSTANTS.LISTENER_TYPES.AUTH_REQ, ( err, req ) =>
    {
        e.sender.send( 'onAuthReq', req );
    } );
};

const onContainerReq = ( e ) =>
{
    authenticator.setListener( CONSTANTS.LISTENER_TYPES.CONTAINER_REQ, ( err, req ) =>
    {
        e.sender.send( 'onContainerReq', req );
    } );
};

const onSharedMDataReq = ( e ) =>
{
    authenticator.setListener( CONSTANTS.LISTENER_TYPES.MDATA_REQ, ( err, req ) =>
    {
        e.sender.send( 'onSharedMDataReq', req );
    } );
};

const onAuthDecision = ( authData, isAllowed ) =>
{
    logger.verbose( 'IPC.js: onAuthDecision running...', authData, isAllowed );
    if ( !authData )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'URL' ) ) ) );
    }

    if ( typeof isAllowed !== 'boolean' )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'IsAllowed' ) ) ) );
    }


    authenticator.encodeAuthResp( authData, isAllowed )
        .then( ( res ) =>
        {
            logger.info( 'IPC.js: Successfully encoded auth response. Sending.', authData );
            reqQ.req.res = res;

            if ( allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].resolve( res );
                delete allAuthCallBacks[reqQ.req.id];
            }
            else
            {
                openExternal( res );
            }

            reqQ.next();
        } )
        .catch( ( err ) =>
        {
            reqQ.req.error = err;
            logger.error( 'Auth decision error :: ', err.message );

            if ( allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].reject( err );
                delete allAuthCallBacks[reqQ.req.id];
            }

            reqQ.next();
        } );
};

const onContainerDecision = ( contData, isAllowed ) =>
{
    if ( !contData )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'URL' ) ) ) );
    }

    if ( typeof isAllowed !== 'boolean' )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'IsAllowed' ) ) ) );
    }

    authenticator.encodeContainersResp( contData, isAllowed )
        .then( ( res ) =>
        {
            reqQ.req.res = res;
            if ( allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].resolve( res );
                delete allAuthCallBacks[reqQ.req.id];
            }
            else
            {
                openExternal( res );
            }

            reqQ.next();
        } )
        .catch( ( err ) =>
        {
            reqQ.req.error = err;

            if ( allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].reject( err );
                delete allAuthCallBacks[reqQ.req.id];
            }

            logger.error( errConst.CONTAINER_DECISION_RESP.msg( err ) );
            reqQ.next();
        } );
};

const onSharedMDataDecision = ( data, isAllowed ) =>
{
    if ( !data )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'URL' ) ) ) );
    }

    if ( typeof isAllowed !== 'boolean' )
    {
        return Promise.reject( new Error( i18n.__( 'messages.should_not_be_empty', i18n.__( 'IsAllowed' ) ) ) );
    }

    authenticator.encodeMDataResp( data, isAllowed )
        .then( ( res ) =>
        {
            reqQ.req.res = res;

            if ( allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].resolve( res );
                delete allAuthCallBacks[reqQ.req.id];
            }
            else
            {
                openExternal( res );
            }

            reqQ.next();
        } )
        .catch( ( err ) =>
        {
            reqQ.req.error = err;
            logger.error( errConst.SHAREMD_DECISION_RESP.msg( err ) );

            if ( !allAuthCallBacks[reqQ.req.id] )
            {
                allAuthCallBacks[reqQ.req.id].reject( res );
                delete allAuthCallBacks[reqQ.req.id];
                reqQ.next();
            }

        } );
};

const onReqError = ( e ) =>
{
    authenticator.setListener( CONSTANTS.LISTENER_TYPES.REQUEST_ERR, ( err ) =>
    {
        reqQ.req.error = err;
        e.sender.send( 'onAuthResError', reqQ.req );
        reqQ.next();
    } );
};

const skipAuthReq = () =>
{
    reqQ.next();
};


export const callIPC = {
    registerSafeNetworkListener : registerNetworkListener,
    enqueueRequest              : enqueueRequest,
    registerOnAuthReq           : onAuthReq,
    registerOnContainerReq      : onContainerReq,
    registerOnSharedMDataReq    : onSharedMDataReq,
    registerAuthDecision        : onAuthDecision,
    registerContainerDecision   : onContainerDecision,
    registerSharedMDataDecision : onSharedMDataDecision,
    registerOnReqError          : onReqError,
    skipAuthRequest             : skipAuthReq
};
