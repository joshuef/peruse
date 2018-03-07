// @flow
import { createActions }from 'redux-actions';
import initialAppState from './initialAppState';

import { TYPES } from 'actions/authenticator_actions';

const initialState = initialAppState.authenticator;

export default function authenticator( state: object = initialState, action )
{
    const payload = action.payload;

    switch ( action.type )
    {
        case TYPES.SET_AUTH_LIB_STATUS :
        {
            return { ...state, libStatus : payload };
        }
        case TYPES.SET_AUTH_HANDLE :
        {
            return { ...state, authenticatorHandle : payload };
        }
        case TYPES.SET_AUTH_NETWORK_STATUS :
        {
            return { ...state, networkState : payload };
        }
        case TYPES.ADD_AUTH_REQUEST :
        {
            const oldQueue = state.authenticationQueue;
            const updatedQueue = [...oldQueue];

            updatedQueue.push( payload );
            return { ...state, authenticationQueue : updatedQueue };
        }
        case TYPES.REMOVE_AUTH_REQUEST :
        {
            const oldQueue = state.authenticationQueue;
            const updatedQueue = [ ...oldQueue ];

            const indexToRemove = updatedQueue.findIndex( url => url === payload );

            updatedQueue.splice( indexToRemove, 1 );
            return { ...state, authenticationQueue : updatedQueue };
        }

        default:
            return state;
    }
}
