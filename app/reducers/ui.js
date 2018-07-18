// @flow
import { createActions }from 'redux-actions';
import initialAppState from './initialAppState';
import { TYPES } from 'actions/ui_actions';

const initialState = initialAppState.ui;

export default function ui( state: array = initialState, action )
{
    const payload = action.payload;

    switch ( action.type )
    {
        case TYPES.SELECT_ADDRESS_BAR :
        {
            return { ...state, addressBarIsSelected : true };
        }
        case TYPES.DESELECT_ADDRESS_BAR :
        {
            return { ...state, addressBarIsSelected : false };
        }
        case TYPES.BLUR_ADDRESS_BAR :
        {
            return { ...state, addressBarIsSelected : false };
        }
        case TYPES.RELOAD_PAGE :
        {
            return { ...state, isActiveTabReloading: true };
        }
        case TYPES.PAGE_LOADED :
        {
            return { ...state, isActiveTabReloading: false };
        }

        default:
            return state;
    }
}
