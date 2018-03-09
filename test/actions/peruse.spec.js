import * as peruseAppActions from 'actions/peruse_actions';

describe( 'notification actions', () =>
{
    it( 'should have types', () =>
    {
        expect( peruseAppActions.TYPES ).toBeDefined();
    } );

    it( 'should setAppStatus', () =>
    {
        const payload = 'authing'
        const expectedAction = {
            type : peruseAppActions.TYPES.SET_APP_STATUS,
            payload
        };
        expect( peruseAppActions.setAppStatus( payload ) ).toEqual( expectedAction );
    } );

    it( 'should set getConfigStatus', () =>
    {
        const expectedAction = {
            type : peruseAppActions.TYPES.SET_READ_CONFIG_STATUS
        };
        expect( peruseAppActions.setReadConfigStatus( ) ).toEqual( expectedAction );
    } );

    it( 'should setSaveConfigStatus', () =>
    {
        const expectedAction = {
            type : peruseAppActions.TYPES.SET_SAVE_CONFIG_STATUS
        };
        expect( peruseAppActions.setSaveConfigStatus( ) ).toEqual( expectedAction );
    } );

    it( 'should have RECEIVED_CONFIG', () =>
    {
        const payload = {};
        const expectedAction = {
            type : peruseAppActions.TYPES.RECEIVED_CONFIG,
            payload
        };
        expect( peruseAppActions.receivedConfig( payload ) ).toEqual( expectedAction );
    } );

    it( 'should have RECEIVED_AUTH_RESPONSE', () =>
    {
        const payload = 'lalalalallaaaaaaa';
        const expectedAction = {
            type : peruseAppActions.TYPES.RECEIVED_AUTH_RESPONSE,
            payload
        };
        expect( peruseAppActions.receivedAuthResponse( payload ) ).toEqual( expectedAction );
    } );


    it( 'should set network status', () =>
    {
        const expectedAction = {
            type : peruseAppActions.TYPES.SET_NETWORK_STATUS
        };
        expect( peruseAppActions.setNetworkStatus( ) ).toEqual( expectedAction );
    } );

    it( 'should reconnectSafeApp', () =>
    {
        const expectedAction = {
            type : peruseAppActions.TYPES.RECONNECT_SAFE_APP
        };
        expect( peruseAppActions.reconnectSafeApp( ) ).toEqual( expectedAction );
    } );

    it( 'should resetStore', () =>
    {
        const expectedAction = {
            type : peruseAppActions.TYPES.RESET_STORE
        };
        expect( peruseAppActions.resetStore( ) ).toEqual( expectedAction );
    } );
} );
