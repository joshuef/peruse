import * as webviewPreload from 'extensions/safe/webviewPreload';
import { APP_INFO, startedRunningProduction } from 'appConstants';


// avoid appveyour for its weak.ref issues right now.
const APPVEYOR = process.env.APPVEYOR;



describe('SAFE manageWebIdUpdates', () => {
    if ( APPVEYOR ) return;

    let win = {};
    let store = { subscribe: jest.fn() }; //need to mock store. should be called once.
    beforeEach( () =>
    {
        webviewPreload.manageWebIdUpdates( store, win )
    });

    test( 'webIdEventEmitter should exist', () =>
    {
        expect( win.webIdEventEmitter ).not.toBeNull()
    })

    test( 'webIdEventEmitter should emit events', async () =>
    {
        expect.assertions(1)
        const theData = 'webId!!!';
        win.webIdEventEmitter.on('update', (data) =>
        {
            expect( data ).toBe( theData )
        })

        win.webIdEventEmitter.emit( 'update', theData );
    })

    xtest( 'Check response to store change?');

})

describe('SAFE Webview Preload APIs', () =>
{
    if ( APPVEYOR )
    {
        return;
    }

    let win = {};
    let store = jest.fn(); //need to mock store. should be called once.
    beforeEach( () =>
    {
        webviewPreload.setupSafeAPIs( store, win )
    });

    test('setupSafeAPIs populates the window object', async () =>
    {
        expect.assertions(5);

        expect( win ).toHaveProperty('safe');
        expect( win.safe ).toHaveProperty('CONSTANTS');
        expect( win.safe ).toHaveProperty('initialiseApp');
        expect( win.safe ).toHaveProperty('fromAuthUri');
        expect( win.safe ).toHaveProperty('authorise');
    });


    test('window.safe.authorise exists', async () =>
    {
        expect.assertions(2);
        expect(win.safe.authorise).not.toBeUndefined()

        try {
            await win.safe.authorise();

        } catch (e) {
            expect( e.message ).toBe('Auth object is required')
        }
    })

    // skip final tests in a production environment as libs dont exist
    if( startedRunningProduction ) return;

    test('setupSafeApis\s safe.initialiseApp', async () =>
    {
        expect.assertions(5);

        try
        {
            await win.safe.initialiseApp();
        }
        catch( e )
        {
            expect( e.message ).not.toBeNull();
            expect( e.message ).toBe('Cannot read property \'id\' of undefined');
        }

        let app = await win.safe.initialiseApp( APP_INFO.info );

        expect( app ).not.toBeNull()
        expect( app.auth ).not.toBeUndefined()
        expect( app.auth.openUri() ).toBeUndefined()

    });


    test('setupSafeAPIs\s safe.fromAuthUri, gets initialiseApp errors', async () =>
    {
        expect.assertions(3);

        try
        {
            await win.safe.fromAuthUri();
        }
        catch( e )
        {
            //error from initApp.
            expect( e.message ).not.toBeNull();
            expect( e.message ).toBe('Cannot read property \'id\' of undefined');
        }

        win.safe.initialiseApp = jest.fn()
                                    .mockName('mockInitApp');

        try
        {
            await win.safe.fromAuthUri();
        }
        catch( e )
        {
            expect( win.safe.initialiseApp.mock.calls.length ).toBe(1)
        }

    });

});
