/* eslint-disable func-names */
import tabs from 'reducers/tabs';
import { TYPES } from 'actions/tabs_actions';
import { TYPES as UI_TYPES } from 'actions/ui_actions';
import initialState from 'reducers/initialAppState';

describe( 'tabs reducer', () =>
{
    const basicTab = {
        url          : 'safe://hello',
        windowId     : 1,
        index        : 0,
        historyIndex : 0,
        history      : ['safe://hello']
    };

    it( 'should return the initial state', () =>
    {
        expect( tabs( undefined, {} ) ).toEqual( initialState.tabs );
    } );

    describe( 'ADD_TAB', () =>
    {
        it( 'should handle adding a tab', () =>
        {
            expect(
                tabs( [], {
                    type    : TYPES.ADD_TAB,
                    payload : { url: 'safe://hello' }
                } )
            ).toEqual( [
                basicTab
            ] );
        } );

        it( 'should handle adding a second tab', () =>
        {
            expect(
                tabs(
                    [basicTab],
                    {
                        type    : TYPES.ADD_TAB,
                        payload : {
                            url : 'safe://another-url'
                        }
                    }
                )
            ).toEqual( [
                basicTab,
                {
                    url          : 'safe://another-url',
                    windowId     : 1,
                    historyIndex : 0,
                    index        : 1,
                    history      : ['safe://another-url'],
                }
            ] );
        } );

        it( 'should deactivate prev active tab if isActive is set to true and ignore other windows\' tabs', () =>
        {
            const activeTab = { ...basicTab, isActiveTab: true };
            const activeTabAnotherWindow = { ...basicTab, index: 1, isActiveTab: true, windowId: 2 };

            expect(
                tabs(
                    [activeTab, activeTabAnotherWindow],
                    {
                        type    : TYPES.ADD_TAB,
                        payload : {
                            url         : 'safe://another-url',
                            isActiveTab : true
                        }
                    }
                )
            ).toEqual( [
                {
                    ...activeTab,
                    isActiveTab : false
                },
                activeTabAnotherWindow,
                {
                    url          : 'safe://another-url',
                    windowId     : 1,
                    historyIndex : 0,
                    index        : 2,
                    history      : ['safe://another-url'],
                    isActiveTab  : true
                }
            ] );
        } );
    } );


    describe( 'SET_ACTIVE_TAB', () =>
    {
        const activeTab = { ...basicTab, isActiveTab: true };

        it( 'should set the active tab', () =>
        {
            expect(
                tabs( [basicTab], {
                    type    : TYPES.SET_ACTIVE_TAB,
                    payload : { index: 0 }
                } )
            ).toEqual( [
                {
                    ...basicTab,
                    isActiveTab : true,
                    isClosed    : false
                }
            ] );
        } );

        it( 'deactivate the previous active tab', () =>
        {
            expect(
                tabs( [activeTab, basicTab], {
                    type    : TYPES.SET_ACTIVE_TAB,
                    payload : { index: 1 }
                } )
            ).toEqual( [
                { ...activeTab, isActiveTab: false },
                {
                    ...basicTab,
                    isActiveTab : true,
                    isClosed    : false
                }
            ] );
        } );

        it( 'deactivate the previous active tab ONLY in this window', () =>
        {
            // TODO. This test needs to account for many windows.
            const anotherWindowTab = { ...basicTab, windowId: 2 };
            const anotherWindowActiveTab = { ...basicTab, windowId: 2, isActiveTab: true };
            const newState = tabs( [activeTab, anotherWindowTab, anotherWindowActiveTab, basicTab], {
                type    : TYPES.SET_ACTIVE_TAB,
                payload : { index: 3 }
            } );
            expect( newState ).toEqual( [
                { ...activeTab, isActiveTab: false },
                {
                    ...anotherWindowTab
                },
                {
                    ...anotherWindowActiveTab
                },
                {
                    ...basicTab,
                    isActiveTab : true,
                    isClosed    : false
                }
            ] );
        } );
    } );


    describe( 'CLOSE_TAB', () =>
    {
        const activeTab = { ...basicTab, isActiveTab: true };

        it( 'should set the tab as closed and inactive', () =>
        {
            const newTabState = tabs( [activeTab], {
                type    : TYPES.CLOSE_TAB,
                payload : { index: 0 }
            } )[0];

            expect( newTabState ).toMatchObject(
                {
                    ...activeTab,
                    isActiveTab : false,
                    isClosed    : true
                }
            );

            expect( newTabState ).toHaveProperty( 'closedTime' );
        } );

        it( 'should set another tab as active if was active and trigger address update', () =>
        {
            // TODO Mock address update action?
            const newState = tabs( [activeTab, basicTab], {
                type    : TYPES.CLOSE_TAB,
                payload : { index: 0 }
            } );

            expect( newState[0] ).toMatchObject(
                {
                    ...activeTab,
                    isActiveTab : false,
                    isClosed    : true
                }
            );

            expect( newState[1] ).toMatchObject(
                {
                    ...basicTab,
                    isActiveTab : true,
                    isClosed    : false
                }
            );
        } );

        it( 'should not affect a tab in another window', () =>
        {
            // TODO. This test needs to account for many windows.
            const anotherWindowTab = { ...basicTab, index: 1, windowId: 2 };
            const anotherWindowActiveTab = { ...basicTab, index: 2, windowId: 2, isActiveTab: true };
            const lastTab = { ...basicTab, index: 3 };
            const newState = tabs( [activeTab, anotherWindowTab, anotherWindowActiveTab, lastTab], {
                type    : TYPES.CLOSE_TAB,
                payload : { index: 2 }
            } );


            expect( newState[0] ).toMatchObject( activeTab );
            expect( newState[1] ).toMatchObject( {
                ...anotherWindowTab,
                isActiveTab : true,
                isClosed    : false
            } );
            expect( newState[2] ).toMatchObject( {
                ...anotherWindowActiveTab,
                isClosed    : true,
                isActiveTab : false
            } );
            expect( newState[3] ).toMatchObject( { ...basicTab, index: 3 } );
        } );

        test( 'should not set a previously closed tab to active when closed', () =>
        {
            const closedTab = { ...basicTab, isClosed: true, index: 1 };
            const lastActiveTab = { ...activeTab, index: 2 };

            const newState = tabs( [basicTab, closedTab, lastActiveTab], {
                type    : TYPES.CLOSE_TAB,
                payload : { index: 2 }
            } );

            expect( newState[0] ).toMatchObject(
                {
                    ...basicTab,
                    isActiveTab : true,
                    isClosed    : false
                }
            );

            expect( newState[1] ).toMatchObject(
                {
                    ...closedTab,
                    isClosed : true
                }
            );

            expect( newState[2] ).toMatchObject(
                {
                    ...lastActiveTab,
                    isActiveTab : false,
                    isClosed    : true
                }
            );
        } );
    } );


    describe( 'CLOSE_ACTIVE_TAB', () =>
    {
        const activeTab = { ...basicTab, isActiveTab: true, index: 2 };
        const otherTab = { ...basicTab, index: 1 };
        it( 'should set the active tab as closed and inactive', () =>
        {
            const newState = tabs( [basicTab, otherTab, activeTab], {
                type : TYPES.CLOSE_ACTIVE_TAB
            } );

            expect( newState[2] ).toMatchObject(
                {
                    ...activeTab,
                    isActiveTab : false,
                    isClosed    : true
                }
            );

            expect( newState[2] ).toHaveProperty( 'closedTime' );
        } );
    } );


    describe( 'REOPEN_TAB', () =>
    {
        const closedTab = { ...basicTab, isClosed: true, closedTime: '100' };
        const closedTabOlder = { ...basicTab, isClosed: true, closedTime: '10' };

        it( 'should set the last closed tab to be not closed', () =>
        {
            const newState = tabs( [basicTab, closedTabOlder, closedTab], {
                type : TYPES.REOPEN_TAB
            } );

            expect( newState[2] ).toMatchObject(
                {
                    ...closedTab,
                    isClosed   : false,
                    closedTime : null
                }
            );
        } );
    } );

    describe( 'UPDATE_ACTIVE_TAB', () =>
    {
        let activeTab;
        let anotherWindowActiveTab;

        beforeEach( () =>
        {
            activeTab = { ...basicTab, isActiveTab: true };
            anotherWindowActiveTab = { ...activeTab, windowId: 2 };
        } );

        it( 'should throw if no windowId passed', () =>
        {
            try{

                const newState = tabs( [basicTab, basicTab, activeTab], {
                    type    : TYPES.UPDATE_ACTIVE_TAB,
                    payload : { url: 'changed!', title: 'hi' }
                } );
            }
            catch( e )
            {
                expect(e.message).toMatch(/windowId/)
            }
        } );

        it( 'should update the active tab\'s properties', () =>
        {
            const newState = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );

            expect( newState[2] ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changed!',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://changed!']
                }
            );

            expect( newState[2] ).toHaveProperty( 'history' );
            expect( newState[2].history ).toHaveLength( 2 );
        } );

        it( 'should only update the active tab in the same window properties', () =>
        {
            const newState = tabs( [basicTab, basicTab, anotherWindowActiveTab, activeTab], {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );

            expect( newState[3] ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changed!',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://changed!']

                }
            );

            expect( newState[2] ).toMatchObject(
                {
                    ...anotherWindowActiveTab
                }
            );

            expect( newState[2] ).toHaveProperty( 'history' );
            expect( newState[3].history ).toHaveLength( 2 );
        } );

        it( 'should update the active tab\'s with a safe:// url when no protocol is given', () =>
        {
            const newState = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );

            expect( newState[2] ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changed!',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://changed!']
                }
            );

            expect( newState[2] ).toHaveProperty( 'history' );
            expect( newState[2].history ).toHaveLength( 2 );
        } );

        it( 'should return a new history array when URL is changed', () =>
        {
            const newState = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );

            expect( newState[2].history ).not.toBe( activeTab.history );
        } );

        it( 'should not add to history index when same url is given', () =>
        {
            const newState = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );

            const secondState = tabs( newState, {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed!', title: 'hi', windowId: 1 }
            } );
            const thirdState = tabs( secondState, {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed#woooo', title: 'hi', windowId: 1 }
            } );

            const fourthState = tabs( thirdState, {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'changed#woooo', title: 'hi', windowId: 1 }
            } );

            expect( secondState[2] ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changed!',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://changed!']
                }
            );

            expect( fourthState[2] ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changed#woooo',
                    title        : 'hi',
                    historyIndex : 2,
                    history      : ['safe://hello', 'safe://changed!', 'safe://changed#woooo']
                }
            );

            expect( fourthState[2].history.length ).toBe( 3 );
        } );
    } );


    describe( 'UPDATE_TAB', () =>
    {
        const activeTab = { ...basicTab, isActiveTab: true, index: 2 };
        const secondTab = { ...basicTab, index: 1 };

        it( 'should update the tab specified in the payload', () =>
        {
            const newState = tabs( [basicTab, secondTab, activeTab], {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'changedagain!', title: 'hi', index: 2 }
            } );
            const updatedTab = newState[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://changedagain!',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://changedagain!']
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );
        } );

        // REENABLE once visiableURL and URL are added
        xit( 'should not update the history/index with minor a slash addition', () =>
        {
            const newState = tabs( [basicTab, secondTab, activeTab], {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'safe://hello/', title: 'hi', index: 2 }
            } );
            const updatedTab = newState[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://hello',
                    title        : 'hi',
                    historyIndex : 0,
                    history      : ['safe://hello']
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );
            expect( updatedTab.history ).toHaveLength( 1 );
        } );

        it( 'should not update the history/index with minor a slash removal', () =>
        {
            const newState = tabs( [{ ...basicTab, url: 'safe://hello/' }, secondTab, activeTab], {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'safe://hello', title: 'hi', index: 2 }
            } );
            const updatedTab = newState[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://hello',
                    title        : 'hi',
                    historyIndex : 0,
                    history      : ['safe://hello']
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );
            expect( updatedTab.history ).toHaveLength( 1 );
        } );

        it( 'should not update the history/index with minor a hash addition', () =>
        {
            const newState = tabs( [basicTab, secondTab, activeTab], {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'safe://hello/#', title: 'hi', index: 2 }
            } );
            const updatedTab = newState[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://hello',
                    title        : 'hi',
                    historyIndex : 0,
                    history      : ['safe://hello']
                }
            );

            const secondState = tabs( newState, {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'safe://hello/#/', title: 'hi', index: 2 }
            } );

            const tabAgain = secondState[2];

            expect( updatedTab.url ).toBe( 'safe://hello' );
            expect( updatedTab ).toHaveProperty( 'history' );
            expect( updatedTab.history ).toHaveLength( 1 );


            expect( tabAgain.url ).toBe( 'safe://hello' );
            expect( tabAgain ).toHaveProperty( 'history' );
            expect( tabAgain.history ).toHaveLength( 1 );
        } );

        it( 'should update the history/index with large a hash addition', () =>
        {
            const newState = tabs( [basicTab, secondTab, activeTab], {
                type    : TYPES.UPDATE_TAB,
                payload : { url: 'safe://hello/#/boom/', title: 'hi', index: 2 }
            } );
            const updatedTab = newState[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://hello/#/boom',
                    title        : 'hi',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://hello/#/boom']
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );
            expect( updatedTab.history ).toHaveLength( 2 );
        } );
    } );


    describe( 'ACTIVE_TAB_FORWARDS', () =>
    {
        const activeTab = {
            ...basicTab,
            isActiveTab  : true,
            history      : ['hello', 'forward', 'forward again'],
            historyIndex : 0
        };

        it( 'should move the active tab forwards', () =>
        {
            const firstUpdate = tabs( [basicTab, basicTab, activeTab], {
                type : TYPES.ACTIVE_TAB_FORWARDS
            } );

            const updatedTab = firstUpdate[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'forward',
                    historyIndex : 1
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );

            const secondUpdate = tabs( firstUpdate, {
                type : TYPES.ACTIVE_TAB_FORWARDS
            } );

            const updatedTabAgain = secondUpdate[2];
            expect( updatedTabAgain ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'forward again',
                    historyIndex : 2
                }
            );


            const thirdUpdate = tabs( secondUpdate, {
                type : TYPES.ACTIVE_TAB_FORWARDS
            } );

            const updatedTabThree = thirdUpdate[2];
            expect( updatedTabThree ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'forward again',
                    historyIndex : 2
                }
            );
        } );
    } );

    describe( 'ACTIVE_TAB_BACKWARDS', () =>
    {
        const activeTab = {
            ...basicTab,
            isActiveTab  : true,
            history      : ['hello', 'forward', 'forward again'],
            historyIndex : 2,
            url          : 'forward again'
        };

        it( 'should move the active tab backwards in time', () =>
        {
            const firstUpdate = tabs( [basicTab, basicTab, activeTab], {
                type : TYPES.ACTIVE_TAB_BACKWARDS
            } );

            const updatedTab = firstUpdate[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'forward',
                    historyIndex : 1
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );

            const secondState = tabs( firstUpdate, {
                type : TYPES.ACTIVE_TAB_BACKWARDS
            } );

            const updatedTabAgain = secondState[2];
            expect( updatedTabAgain ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'hello',
                    historyIndex : 0
                }
            );

            const thirdState = tabs( secondState, {
                type : TYPES.ACTIVE_TAB_BACKWARDS
            } );

            const updatedTabThree = thirdState[2];
            expect( updatedTabThree ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'hello',
                    historyIndex : 0
                }
            );
        } );
    } );


    describe( 'More complex navigation', () =>
    {
        const activeTab = {
            ...basicTab,
            isActiveTab  : true,
            history      : ['safe://hello', 'safe://forward', 'safe://forward again', 'safe://another', 'safe://anotheranother'],
            historyIndex : 0,
            windowId: 1
        };

        it( 'should remove history on forward/backwards/newURL navigations', () =>
        {
            const firstUpdate = tabs( [basicTab, basicTab, activeTab], {
                type : TYPES.ACTIVE_TAB_FORWARDS
            } );

            const updatedTab = firstUpdate[2];
            expect( updatedTab ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://forward',
                    historyIndex : 1
                }
            );

            expect( updatedTab ).toHaveProperty( 'history' );
            expect( updatedTab.history ).toHaveLength( 5 );

            const secondUpdate = tabs( firstUpdate, {
                type : TYPES.ACTIVE_TAB_BACKWARDS
            } );

            const updatedTabAgain = secondUpdate[2];
            expect( updatedTabAgain ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://hello',
                    historyIndex : 0
                }
            );

            expect( updatedTabAgain ).toHaveProperty( 'history' );
            expect( updatedTabAgain.history ).toHaveLength( 5 );

            const thirdUpdate = tabs( secondUpdate, {
                type    : TYPES.UPDATE_ACTIVE_TAB,
                payload : { url: 'safe://new url overwriting previous history array', windowId: 1 }
            } );

            const updatedTabThree = thirdUpdate[2];
            expect( updatedTabThree ).toMatchObject(
                {
                    ...activeTab,
                    url          : 'safe://new url overwriting previous history array',
                    historyIndex : 1,
                    history      : ['safe://hello', 'safe://new url overwriting previous history array']
                }
            );

            expect( updatedTabThree ).toHaveProperty( 'history' );
            expect( updatedTabThree.history ).toHaveLength( 2 );
        } );
    } );

    describe( 'UPDATE_TABS', () =>
    {
        const activeTab = {
            ...basicTab,
            isActiveTab  : true,
            history      : ['hello', 'forward', 'forward again'],
            historyIndex : 2,
            url          : 'forward again'
        };


        const receivedTab = {
            ...basicTab,
            url          : 'safe://received',
            historyIndex : 0,
            index        : 2
        };

        it( 'should not override the current active tab', () =>
        {
            const openReceived = { ...receivedTab, isClosed: false };
            // TODO: Add option for this?
            const updatedTabs = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_TABS,
                payload : { tabs: [openReceived] }
            } );

            expect( updatedTabs[3] ).toMatchObject( {
                ...receivedTab,
                isActiveTab : false,
                index       : 3
            } );
        } );
        it( 'should not open the received tabs', () =>
        {
            const openReceived = { ...receivedTab, isClosed: false };
            // TODO: Add option for this?
            const updatedTabs = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_TABS,
                payload : { tabs: [openReceived] }
            } );

            expect( updatedTabs[3] ).toMatchObject( {
                ...receivedTab,
                isClosed : true,
                index    : 3
            } );
        } );

        it( 'should handle receiving the new config', () =>
        {
            const updatedTabs = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_TABS,
                payload : { tabs: [receivedTab] }
            } );

            expect( updatedTabs[3] ).toMatchObject( { ...receivedTab, index: 3 } );
        } );

        it( 'should merge the new array with current array', () =>
        {
            const updatedTabs = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_TABS,
                payload : { tabs: [receivedTab] }
            } );

            expect( updatedTabs[0] ).toMatchObject( { ...basicTab, index: 0 } );
            expect( updatedTabs[2] ).toMatchObject( { ...activeTab, index: 2 } );
            expect( updatedTabs[3] ).toMatchObject( { ...receivedTab, index: 3 } );
        } );

        it( 'should update the index of received tabs', () =>
        {
            const updatedTabs = tabs( [basicTab, basicTab, activeTab], {
                type    : TYPES.UPDATE_TABS,
                payload : { tabs: [receivedTab] }
            } );

            expect( updatedTabs[0].index ).toBe( 0 );
            expect( updatedTabs[1].index ).toBe( 1 );
            expect( updatedTabs[2].index ).toBe( 2 );
            expect( updatedTabs[3].index ).toBe( 3 );
        } );
    } );


    describe( 'UI_RESET_STORE', () =>
    {
        it( 'should reset tabs to the inital state', () =>
        {
            const tabsPostLogout = tabs( [basicTab, basicTab, basicTab], {
                type : UI_TYPES.RESET_STORE,
            } );
            expect( tabsPostLogout ).toHaveLength( 1 );
            expect( tabsPostLogout ).toMatchObject( initialState.tabs );
        } );
    } );
} );
