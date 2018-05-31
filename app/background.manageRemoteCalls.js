/* eslint global-require: 1, flowtype-errors/show-errors: 0 */
import logger from 'logger';
import { onRemoteCallInMain, getRemoteCallApis } from 'extensions';
import * as remoteCallActions from 'actions/remoteCall_actions';

let cachedRemoteCallArray = [];
const pendingCallIds = {};

const extensionApisToAdd = getRemoteCallApis();

const allApiCalls = {
    ...extensionApisToAdd
}

/**
 * Handle store changes to remoteCall array, binding listeners, and awaiting call completion before
 * updating the remoteCall.
 * @param  {[type]}  store Redux store
 */
const manageRemoteCalls = async ( store ) =>
{
    const state = store.getState();
    const remoteCalls = state.remoteCalls;
    if ( cachedRemoteCallArray !== remoteCalls )
    {
        cachedRemoteCallArray = remoteCalls;

        if ( !remoteCalls.length ) return;

        remoteCalls.forEach( async ( theCall ) =>
        {
            if ( !theCall.inProgress && !pendingCallIds[theCall.id] )
            {
                // hack to prevent multi store triggering.
                // not needed for auth via redux.
                pendingCallIds[theCall.id] = 'pending';

                if ( allApiCalls[theCall.name] )
                {
                    logger.verbose('Remote Calling: ', theCall.name)
                    store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, inProgress: true } ) );
                    const theArgs = theCall.args;

                    onRemoteCallInMain( store, allApiCalls, theCall );

                    if ( theCall.isListener ) { return };

                    try
                    {
                        // call the API.
                        const argsForCalling = theArgs || [];
                        const response = await allApiCalls[theCall.name]( ...argsForCalling );
                        store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, done: true, response } ) );
                    }
                    catch ( e )
                    {
                        store.dispatch( remoteCallActions.updateRemoteCall( { ...theCall, error: e.message || e } ) );
                    }
                }
                else
                {
                    console.log( theCall.name, ' does not exist' );
                }
            }
        } );
    }
};

export default manageRemoteCalls;
