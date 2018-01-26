
// @flow
import { remote, shell, webContents } from 'electron';
import { TYPES } from 'actions/tabs_actions';
import { TYPES as SAFE_TYPES } from 'actions/safe_actions';
import { makeValidUrl } from 'utils/urlHelpers';
import initialAppState from './initialAppState';
import { CONFIG } from 'appConstants';

const initialState = initialAppState.tabs;

/**
 * Retrieve the active tab object for a given windowId.
 * @param  { Array } state    State array
 * @param  { Integer } windowId  BrowserWindow webContents Id of target window.
 */
const getActiveTab = ( state, windowId ) => state.find( tab =>
{
    const currentWindowId = windowId || getCurrentWindowId( );
    return tab.isActiveTab && tab.windowId === currentWindowId;
} );

/**
 * Retrieve the active tab index for a given windowId.
 * @param  { Array } state    State array
 * @param  { Integer } windowId  BrowserWindow webContents Id of target window.
 */
const getActiveTabIndex = ( state, windowId ) =>
{
    const currentWindowId = windowId || getCurrentWindowId( );

    return state.findIndex( tab =>
        tab.isActiveTab && tab.windowId === currentWindowId );
};

/**
 * Get the current window's webcontents Id. Defaults to `1` if none found.
 * @return { Integer } WebContents Id of the curremt BrowserWindow webcontents.
 */
const getCurrentWindowId = ( ) =>
{
    let currentWindowId = 1; //for testing

    if ( remote )
    {
        currentWindowId = remote.getCurrentWindow().webContents.id;
    }
    else if ( webContents )
    {
        let allWindows = webContents.getAllWebContents();

        let currentWindow = allWindows.filter( win => {
            return win.history[0] === CONFIG.APP_HTML_PATH;
        });

        currentWindowId = currentWindow.id;
    }

    return currentWindowId;
};

const addTab = ( state, tab ) =>
{
    if ( !tab )
    {
        throw new Error( 'You must pass a tab object with url' );
    }

    const currentWindowId = getCurrentWindowId( );

    const targetWindowId = tab.windowId || currentWindowId;
    const tabUrl = makeValidUrl( tab.url || '' );
    const newTab = { ...tab, windowId: targetWindowId, historyIndex: 0, history: [tabUrl] };

    let newState = [...state];

    // Prevent http tabs at all
    // TODO. This via middleware
    if ( tab.url.startsWith( 'http' ) )
    {
        shell.openExternal( tab.url );
        return state;
    }

    if ( newTab.isActiveTab )
    {
        newState = deactivateOldActiveTab( newState, targetWindowId );
    }

    newState.push( newTab );

    return newState;
};


/**
 * Set a tab as closed. If it is active, deactivate and and set a new active tab
 * @param { array } state
 * @param { object } payload
 */
const closeTab = ( state, payload ) =>
{
    const index = payload.index;
    const currentWindowId = getCurrentWindowId();
    const tabToMerge = state[index];
    const targetWindowId = tabToMerge ? tabToMerge.windowId || currentWindowId : currentWindowId;
    const openTabs = state.filter( tab => !tab.isClosed && tab.windowId === targetWindowId );

    const updatedTab = {
        ...tabToMerge, isActiveTab : false, index, isClosed    : true, closedTime  : new Date()
    };
    let updatedState = [...state];
    updatedState[index] = updatedTab;

    if ( tabToMerge.isActiveTab )
    {
        const ourTabIndex = openTabs.findIndex( tab => tab === tabToMerge );

        const nextTab = ourTabIndex + 1;
        const prevTab = ourTabIndex - 1;
        const targetOpenTabsIndex = openTabs.length > nextTab ? nextTab : prevTab;
        let targetIndex;


        if ( targetOpenTabsIndex >= 0 )
        {
            const newOpenTab = openTabs[targetOpenTabsIndex];

            targetIndex = updatedState.findIndex( tab => tab === newOpenTab );
        }

        updatedState = setActiveTab( updatedState, { index: targetIndex } );
    }

    return updatedState;
};


const closeActiveTab = ( state, windowId ) =>
{
    const activeTabIndex = getActiveTabIndex( state, windowId );

    return closeTab( state, { index: activeTabIndex } );
};


const deactivateOldActiveTab = ( state, windowId ) =>
{
    const currentWindowId = windowId || getCurrentWindowId();
    const activeTabIndex = getActiveTabIndex( state, currentWindowId );

    if ( activeTabIndex > -1 )
    {
        const oldActiveTab = getActiveTab( state, currentWindowId );
        const updatedOldTab = { ...oldActiveTab, isActiveTab: false };
        const updatedState = [...state];
        updatedState[activeTabIndex] = updatedOldTab;
        return updatedState;
    }

    return state;
};

export function getLastClosedTab( state )
{
    let i = 0;
    const tabAndIndex = {
        lastTabIndex : 0
    };

    const tab = state.reduce( ( prev, current ) =>
    {
        let tab;
        if ( !prev.closedTime || current.closedTime > prev.closedTime )
        {
            tabAndIndex.lastTabIndex = i;
            tab = current;
        }
        else
        {
            tab = prev;
        }

        i += 1;
        return tab;
    }, state[0] );

    tabAndIndex.lastTab = tab;

    return tabAndIndex;
}


const moveActiveTabForward = ( state ) =>
{
    const tab = getActiveTab( state );
    const index = getActiveTabIndex( state );
    const updatedTab = { ...tab };

    const history = updatedTab.history;

    const nextHistoryIndex = updatedTab.historyIndex + 1 || 1;

    // -1 historyIndex signifies latest page
    if ( !history || history.length < 2 || !history[nextHistoryIndex] )
    {
        return state;
    }

    const newUrl = history[nextHistoryIndex];

    const updatedState = [...state];

    updatedTab.historyIndex = nextHistoryIndex;
    updatedTab.url = newUrl;

    updatedState[index] = updatedTab;
    return updatedState;
};


const moveActiveTabBackwards = ( state ) =>
{
    const tab = getActiveTab( state );
    const index = getActiveTabIndex( state );
    const updatedTab = { ...tab };
    const history = updatedTab.history;
    const nextHistoryIndex = updatedTab.historyIndex - 1 || 0;

    // -1 historyIndex signifies latest page
    if ( !history || history.length < 2 || !history[nextHistoryIndex] ||
        nextHistoryIndex < 0 )
    {
        return state;
    }

    const newUrl = history[nextHistoryIndex];

    const updatedState = [...state];

    updatedTab.historyIndex = nextHistoryIndex;
    updatedTab.url = newUrl;

    updatedState[index] = updatedTab;
    return updatedState;
};

const reopenTab = ( state ) =>
{
    let { lastTab, lastTabIndex } = getLastClosedTab( state );

    lastTab = { ...lastTab, isClosed: false, closedTime: null };
    const updatedState = [...state];

    updatedState[lastTabIndex] = lastTab;

    return updatedState;
};


/**
 * set active tab to a given index
 * @param       { Int } index index to set as activeTabIndex
 * @param       { Array } state the state array of tabs
 * @constructor
 */
const setActiveTab = ( state, payload ) =>
{
    const index = payload.index;
    const newActiveTab = state[index];
    let updatedState = [...state];

    if ( newActiveTab )
    {
        const targetWindowId = newActiveTab.windowId;

        updatedState = deactivateOldActiveTab( updatedState, targetWindowId );
        updatedState[index] = { ...newActiveTab, isActiveTab: true, isClosed: false };
    }

    return updatedState;
};


const updateTabHistory = ( tabToMerge, url ) =>
{
    const updatedTab = { ...tabToMerge };
    if ( url && url !== tabToMerge.url )
    {
        if ( updatedTab.history )
        {
            updatedTab.historyIndex += 1;
            updatedTab.history.push( url );
        }
    }
    return updatedTab;
};


const updateActiveTab = ( state, payload ) =>
{
    const index = getActiveTabIndex( state );

    if ( index < 0 )
    {
        return state;
    }

    const tabToMerge = state[index];

    const targetWindowId = tabToMerge.windowId || getCurrentWindowId();

    let updatedTab = { ...tabToMerge };

    const url = makeValidUrl( payload.url );

    updatedTab = updateTabHistory( updatedTab, url );
    updatedTab = { ...updatedTab, ...payload };
    updatedTab = { ...updatedTab, url };

    const updatedState = [...state];

    updatedState[index] = updatedTab;
    return updatedState;
};


const updateTab = ( state, payload ) =>
{
    const index = payload.index;

    if ( index < 0 )
    {
        return state;
    }

    const tabToMerge = state[index];

    let updatedTab = { ...tabToMerge };

    updatedTab = { ...updatedTab, ...payload };

    if ( payload.url )
    {
        const url = makeValidUrl( payload.url );
        updatedTab = updateTabHistory( updatedTab, url );
        updatedTab = { ...updatedTab, url };
    }

    const updatedState = [...state];

    updatedState[index] = updatedTab;

    return updatedState;
};


/**
 * Tabs reducer. Should handle all tab states, including window/tab id and the individual tab history
 * @param  { array } state  array of tabs
 * @param  { object } action action Object
 * @return { array }        updatd state object
 */
export default function tabs( state: array = initialState, action )
{
    const payload = action.payload;

    if ( action.error )
    {
        console.log( 'ERROR IN ACTION', action.error );
        return state;
    }

    switch ( action.type )
    {
        case TYPES.ADD_TAB :
        {
            return addTab( state, payload );
        }
        case TYPES.SET_ACTIVE_TAB :
        {
            return setActiveTab( state, payload );
        }
        case TYPES.CLOSE_TAB :
        {
            return closeTab( state, payload );
        }
        case TYPES.CLOSE_ACTIVE_TAB :
        {
            return closeActiveTab( state, payload );
        }
        case TYPES.REOPEN_TAB :
        {
            return reopenTab( state );
        }
        case TYPES.UPDATE_ACTIVE_TAB :
        {
            return updateActiveTab( state, payload );
        }
        case TYPES.UPDATE_TAB :
        {
            return updateTab( state, payload );
        }
        case TYPES.ACTIVE_TAB_FORWARDS :
        {
            return moveActiveTabForward( state );
        }
        case TYPES.ACTIVE_TAB_BACKWARDS :
        {
            return moveActiveTabBackwards( state );
        }
        case SAFE_TYPES.RECEIVED_CONFIG :
        {
            const payloadTabs = payload.tabs;

            payloadTabs.forEach( tab =>
            {
                tab.isClosed = true;
                tab.isActiveTab = false;
                return tab;
            });

            const newTabs = [...state, ...payloadTabs];

            // update tab indexes after receiving tabs from store
            const reindexedTabs = newTabs.map( ( tab, index ) =>
            {
                return { ...tab, index };
            });

            return reindexedTabs;
        }
        case SAFE_TYPES.RESET_STORE :
        {
            const initial = initialState;
            const firstTab = { ...initial[0] };
            const currentWindowId = getCurrentWindowId();

            firstTab.windowId = currentWindowId;

            return [firstTab];
        }
        default:
            return state;
    }
}
