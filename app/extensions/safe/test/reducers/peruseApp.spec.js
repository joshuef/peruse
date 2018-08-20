/* eslint-disable func-names */
import peruseApp from 'extensions/safe/reducers/peruseApp';
import { TYPES } from 'extensions/safe/actions/peruse_actions';
import initialState from 'extensions/safe/reducers/initialAppState';
import { CONFIG } from 'appConstants';
import { SAFE } from 'extensions/safe/constants';

const safeInitialState = initialState.peruseApp;

// https://github.com/facebook/jest/issues/3552
jest.mock('extensions/safe/peruseSafeApp', () =>
{
    return {
        getWebIds : () => []
    }
});

describe( 'Peruse App reducer', () =>
{
    it( 'should return the initial state', () =>
    {
        expect( peruseApp( undefined, {} ) ).toEqual( initialState.peruseApp );
    } );


    describe( 'SET_APP_STATUS', () =>
    {
        it( 'should handle app authorisation', () =>
        {
            const payload =   SAFE.APP_STATUS.AUTHORISING;

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_APP_STATUS,
                    payload
                } )
            ).toMatchObject( {
                appStatus     : SAFE.APP_STATUS.AUTHORISING,
            });
        } );
    });


    describe( 'SET_NETWORK_STATUS', () =>
    {
        it( 'should handle network status updates', () =>
        {
            const payload = CONFIG.NET_STATUS_CONNECTED;

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_NETWORK_STATUS,
                    payload
                } )
            ).toMatchObject( {
                networkStatus : CONFIG.NET_STATUS_CONNECTED
            });
        } );
    });

    describe( 'SET_SAVE_CONFIG_STATUS', () =>
    {
        it( 'should handle saving browser', () =>
        {
            const payload =  SAFE.SAVE_STATUS.TO_SAVE;

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.SET_SAVE_CONFIG_STATUS,
                    payload
                } )
            ).toMatchObject( { saveStatus : SAFE.SAVE_STATUS.TO_SAVE } );
        } );
    });


    describe( 'RECEIVED_AUTH_RESPONSE', () =>
    {
        it( 'should handle saving browser', () =>
        {
            const payload =  'URLofAUTHResponse';

            expect(
                peruseApp( safeInitialState, {
                    type    : TYPES.RECEIVED_AUTH_RESPONSE,
                    payload
                } )
            ).toMatchObject( { authResponseUri : payload } );
        } );
    });


    describe( 'SHOW_WEB_ID_DROPDOWN', () =>
    {
        it( 'should handle updating the icon status', () =>
        {
            const payload = true;
            const newState = peruseApp( safeInitialState, {
                type    : TYPES.SHOW_WEB_ID_DROPDOWN,
                payload
            } );
            expect( newState.showingWebIdDropdown ).toBe( true )

            const newState2 = peruseApp( safeInitialState, {
                type    : TYPES.SHOW_WEB_ID_DROPDOWN,
                payload: false
            } );
            expect( newState2.showingWebIdDropdown ).toBe( false)

        } );
    });

})
