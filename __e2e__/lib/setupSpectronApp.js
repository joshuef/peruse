import { Application } from 'spectron';
import electron from 'electron';
import path from 'path';
import RELEASE_NAME from '../../releaseName.js';

import {
    delay,
    setClientToMainBrowserWindow
} from './browser-driver';

jest.unmock('electron')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

export const isCI = process.env.CI || false;
export const travisOS = process.env.TRAVIS_OS_NAME || '';
export const isUnpacked = process.env.IS_UNPACKED || false;
export const isTestingPackagedApp = process.env.IS_PACKED || false;

export const setupSpectronApp = ( ) =>
{
    const isMac = process.platform === 'darwin'
    const isWin = process.platform === 'win32'
    const macApp = 'Peruse.app/Contents/MacOS/Peruse';

    let application = 'peruse';

    if( isMac ) application = macApp;
    if( isWin ) application = 'Peruse';

    const packedLocation = path.resolve( './release', RELEASE_NAME, application );

    console.log('Is testing packaged app?', isTestingPackagedApp );
    console.log('Packaged application location:', packedLocation );
    const app = new Application( {
        path : isTestingPackagedApp ? packedLocation : electron,
        args : [ isTestingPackagedApp ? '' : path.join( __dirname, '..' , '..', 'app' ) ], // lib, e2e, test
        env  : {
            IS_SPECTRON: true,
            // CI: isCI,
            // TRAVIS_OS_NAME : travisOS,
            // IS_UNPACKED : isUnpacked,
            // IS_PACKED : isTestingPackagedApp
        }
    } );

    return app;

}


export const afterAllTests = ( app ) =>
{
    console.log('that isafterall')
    if ( app && app.isRunning() )
    {
        console.log('app is running so sotp it')
        return app.stop();
    }
}

export const beforeAllTests =  async ( app ) =>
{
    await app.start();
    // console.log('starting', app)
    return app.client.waitUntilWindowLoaded();
} ;


export const windowLoaded = async ( app ) =>
{
    console.log('checking window loadeddddd')
    await delay(7500)
    await setClientToMainBrowserWindow( app );
    // const browser = app.client;
    console.log('window of app is set to:', await app.browserWindow.getTitle())
    await app.browserWindow.show() ; //incase now focussed
    let loaded = await app.browserWindow.isVisible() ;
    console.log('checking window is it vissss', loaded)
    return loaded;
};
