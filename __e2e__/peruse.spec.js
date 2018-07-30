import { parse as urlParse } from 'url';
import { removeTrailingSlash } from 'utils/urlHelpers';
import {
    delay,
    navigateTo,
    newTab,
    setClientToMainBrowserWindow,
    setClientToBackgroundProcessWindow
} from './lib/browser-driver';
import { BROWSER_UI, WAIT_FOR_EXIST_TIMEOUT } from './lib/constants';
import {
    setupSpectronApp
    , isCI
    , travisOS
    , afterAllTests
    , beforeAllTests
    , windowLoaded
} from 'spectron-lib/setupSpectronApp';

jest.unmock( 'electron' );
jasmine.DEFAULT_TIMEOUT_INTERVAL = 65000;

// TODO:
// - Check for protocols/APIs? Via js injection?
// - Check for inspect element availability
// - Check history
// - Check bookmarks
// - Check clicking a link in a page, updates title and webview etc.
// NOTE: Getting errors in e2e for seemingly no reason? Check you havent enabled devtools in menu.js, this makes spectron
// have a bad time.
// TODO: Check that it loads a page from network/mock. Check that it loads images from said page.
// Check that http images are _not_ loaded.

describe( 'main window', () =>
{
    const app = setupSpectronApp();

    beforeAll( async () =>
    {
        await beforeAllTests(app)
    } );

    afterAll( async () =>
    {
        await afterAllTests(app)
    } );


    test( 'window loaded', async () =>
    {
        expect( await windowLoaded( app ) ).toBeTruthy()
    });

    //
    // it( 'LOGGING (amend test): should haven\'t any logs in console of main window', async () =>
    // {
    //     const { client } = app;
    //     const logs = await client.getRenderProcessLogs();
    //     // Print renderer process logs
    //     logs.forEach( log =>
    //     {
    //         console.log( log.message );
    //         console.log( log.source );
    //         console.log( log.level );
    //     } );
    //     // expect( logs ).toHaveLength( 0 );
    // } );


    it( 'can open a new tab + set address', async () =>
    {
        expect.assertions(3);
        const { client } = app;
        const tabIndex = await newTab( app );
        await navigateTo( app, 'example.com' );
        await client.waitForExist( BROWSER_UI.ADDRESS_INPUT , WAIT_FOR_EXIST_TIMEOUT);


        await client.pause( 1500 );
        const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );

        await client.windowByIndex( tabIndex );
        await delay( 500 );

        const clientUrl = await client.getUrl();

        const parsedUrl = urlParse( clientUrl );

        expect( parsedUrl.protocol ).toBe( 'safe:' );
        expect( parsedUrl.host ).toBe( 'example.com' );

        expect( address ).toBe( 'safe://example.com' );
    } );


    xit( 'can go backwards', async () =>
    {
        const { client } = app;
        await setClientToMainBrowserWindow( app );
        const tabIndex = await newTab( app );
        await navigateTo( app, 'example.com' );
        await navigateTo( app, 'google.com' );

        await client.waitForExist( BROWSER_UI.BACKWARDS, WAIT_FOR_EXIST_TIMEOUT );
        await client.click( BROWSER_UI.BACKWARDS );
        await client.windowByIndex( tabIndex );
        const clientUrl = removeTrailingSlash( await client.getUrl() );

        expect( clientUrl ).toBe( 'http://example.com' );
    } );


    xit( 'can go forwards', async () =>
    {
        const { client } = app;
        await setClientToMainBrowserWindow( app );
        const tabIndex = await newTab( app );
        await navigateTo( app, 'example.com' );
        await navigateTo( app, 'example.org' );

        await client.waitForExist( BROWSER_UI.BACKWARDS, WAIT_FOR_EXIST_TIMEOUT );
        await client.click( BROWSER_UI.BACKWARDS );
        await client.windowByIndex( tabIndex );

        const clientUrl = removeTrailingSlash( await client.getUrl() );

        // TODO: URL from webview always has trailing slash
        expect( clientUrl ).toBe( 'http://example.com' );

        await setClientToMainBrowserWindow( app );
        await client.pause( 500 );
        await client.waitForExist( BROWSER_UI.FORWARDS, WAIT_FOR_EXIST_TIMEOUT );

        // TODO: why is iting needing two clicks?
        await client.click( BROWSER_UI.FORWARDS );
        await client.click( BROWSER_UI.FORWARDS );

        await client.windowByIndex( tabIndex );
        const clientUrl2 = removeTrailingSlash( await client.getUrl() );

        expect( clientUrl2 ).toBe( 'http://example.org' );
    } );


    it( 'can close a tab', async () =>
    {
        const { client } = app;
        await setClientToMainBrowserWindow( app );
        const tabIndex = await newTab( app );

        await navigateTo( app, 'bbc.com' );
        await client.waitForExist( BROWSER_UI.CLOSE_TAB, WAIT_FOR_EXIST_TIMEOUT );

        await client.click( `${BROWSER_UI.ACTIVE_TAB} ${BROWSER_UI.CLOSE_TAB}` );
        await client.pause( 500 );
        // await client.pause( 500 );

        const address = await client.getValue( BROWSER_UI.ADDRESS_INPUT );
        expect( address ).not.toBe( 'safe://bbc.com' );
    } );

    // TODO: Setup spectron spoofer for these menu interactions.
    xtest( 'closes the window', async () =>
    {
        const { client } = app;
        await setClientToMainBrowserWindow( app );
        await client.waitForExist( BROWSER_UI.ADDRESS_INPUT, WAIT_FOR_EXIST_TIMEOUT );
        await client.pause( 500 );
        await client.click( BROWSER_UI.ADDRESS_INPUT );

        // mac - cmd doesnt work...
        await client.keys( ['\ue03d', '\ue008', 'w'] ); // shift + cmd + w
        // rest - to test on ci...
        await client.keys( ['\ue008', '\ue009', 'w'] ); // shift + ctrl + w
    } );

} );
