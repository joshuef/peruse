
import opn from 'opn';
import { parse as urlParse } from 'url';
import {removeTrailingSlash} from 'utils/urlHelpers';
import {
    navigateTo,
    newTab,
    setClientToMainBrowserWindow,
    setClientToBackgroundProcessWindow,
    delay
} from 'spectron-lib/browser-driver';
import { createSafeApp, createRandomDomain } from './lib/safe-helpers';
import { BROWSER_UI, AUTH_UI, WAIT_FOR_EXIST_TIMEOUT, DEFAULT_TIMEOUT_INTERVAL } from 'spectron-lib/constants';
import {
    setupSpectronApp
    , isCI
    , travisOS
    , afterAllTests
    , beforeAllTests
    , windowLoaded
    , isTestingPackagedApp
} from 'spectron-lib/setupSpectronApp';

jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;


describe( 'SAFE network webFetch operation', async () =>
{
    const appInfo = {
        id: "net.peruse.test",
        name: 'SAFE App Test',
        vendor: 'Peruse'
    };
    let app;

    beforeEach( async () =>
    {
      app = setupSpectronApp();

        await beforeAllTests(app)
    } );

    afterEach( async () =>
    {
        await afterAllTests(app);
        console.log('APP SHOULD BE STOPPED', app.isRunning())
    } );


    test( 'window loaded', async () =>
    {
        expect( await windowLoaded( app ) ).toBeTruthy()
    });

    // it( 'populates the DOM api in the tab window:', async( ) =>
    // {
    //     expect.assertions(5);
    //     await setClientToMainBrowserWindow( app );
    //
    //     const { client } = app;
    //     const tabIndex = await newTab( app );
    //
    //     await navigateTo( app, 'safeAPI.com' );
    //     // await delay( 1500 );
    //
    //     // const windows = await client.getWindowCount()
    //
    //     // TODO: Why -1 here? when others not... ? Something is hanging around...
    //     await client.windowByIndex( tabIndex - 1 );
    //     await client.pause( 1500 );
    //
    //     let theSafeClient = await client.execute( function (){ return window.safe } );
    //     theSafeClient = theSafeClient.value;
    //     // await delay( 2500 );
    //     // await client.pause(1500)
    //
    //
    //     expect( theSafeClient ).toHaveProperty('CONSTANTS');
    //     expect( theSafeClient ).toHaveProperty('VERSION');
    //     expect( theSafeClient ).toHaveProperty('authorise');
    //     expect( theSafeClient ).toHaveProperty('initialiseApp');
    //     expect( theSafeClient ).toHaveProperty('fromAuthUri');
    // })


    // it( 'has safe:// protocol', async () =>
    // {
    //     expect.assertions( 1 );
    //
    //     await setClientToMainBrowserWindow( app );
    //     const { client } = await app;
    //     const tabIndex = await newTab( app );
    //     await delay(500)
    //     await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );
    //
    //     await navigateTo( app, 'test-url.com' );
    //
    //     const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );
    //
    //     await client.windowByIndex( tabIndex - 1 );
    //     await delay(1500)
    //     const clientUrl = await client.getUrl();
    //     const parsedUrl = urlParse( clientUrl );
    //
    //     expect( address ).toBe( 'safe://test-url.com' );
    //     // expect( parsedUrl.protocol ).toBe( 'safe:' );
    // } );

    if( ! isTestingPackagedApp )
    {

        it( 'fetches content from mock network', async () =>
        {
            let safeApp = await createSafeApp(appInfo);
            await safeApp.auth.loginForTest();

            expect.assertions(4);
            const content = `hello world, on ${Math.round(Math.random() * 100000)}`;
            const domain = await createRandomDomain(content, '', '', safeApp);
            const data = await safeApp.webFetch(`safe://${domain}`);

            expect(data.body.toString()).toBe( content );

            const { client } = app;
            const tabIndex = await newTab( app );
            await navigateTo( app, `safe://${domain}` );
            await delay(3500)

            await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );

            await client.windowByIndex( tabIndex  );
            await client.pause(3500);

            let text = await client.getText( 'body' );
            expect( text ).not.toBeNull( );
            expect( text ).toBe( content );
            expect( text.length ).toBe( content.length );
        } );

    }

    // if( travisOS !== 'linux' )
    // {
    //
    //     it( 'is registered to handle safe:// requests:', async( ) =>
    //     {
    //         opn('safe://blabla');
    //         await delay(4500)
    //
    //         setClientToMainBrowserWindow(app);
    //         const { client } = app;
    //         await delay(2500)
    //
    //         await client.waitForExist( BROWSER_UI.ADDRESS_INPUT );
    //         const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );
    //
    //         expect( address ).toBe('safe://blabla');
    //     })
    // }



    // if( travisOS !== 'linux' )
    if( process.platform !== 'linux' )
    {
        test( 'triggers a save for the window state', async () =>
        {
            expect.assertions(1);

            const { client } = app;
            await setClientToMainBrowserWindow( app );
            await delay( 1500 );

            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, WAIT_FOR_EXIST_TIMEOUT );
            await delay( 4500 );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_SAVE );
            await delay( 4500 );
            await client.waitForExist( BROWSER_UI.NOTIFIER_TEXT, WAIT_FOR_EXIST_TIMEOUT );
            const note = await client.getText( BROWSER_UI.NOTIFIER_TEXT );

            expect( note ).toBe( 'Unable to connect to the network. Unauthorised' );
        } );
    }



} );
