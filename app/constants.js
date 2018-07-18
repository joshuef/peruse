
import path from 'path';
import fs from 'fs-extra';
import { remote } from 'electron';
import pkg from 'appPackage';

const platform = process.platform;
const OSX = 'darwin';
const LINUX = 'linux';
const WINDOWS = 'win32';

const allPassedArgs = process.argv;

let shouldRunMockNetwork = fs.existsSync( path.resolve( __dirname, '..', 'startAsMock') );

let hasDebugFlag = false;

if( allPassedArgs.includes('--mock') )
{
    shouldRunMockNetwork = true;
}

if( allPassedArgs.includes('--live') )
{
    shouldRunMockNetwork = false;
}

if( allPassedArgs.includes('--debug') )
{
    hasDebugFlag = true;
}

export const shouldStartAsMockFromFlagsOrPackage = shouldRunMockNetwork;

export const isRunningSpectronTestProcess = process.env.SPECTRON_TEST;

export const isRunningUnpacked = process.env.IS_UNPACKED;
export const isRunningPackaged = !isRunningUnpacked;
export const isRunningSpectronTestProcessingPackagedApp = ( isRunningSpectronTestProcess && isRunningPackaged );


export const env = shouldStartAsMockFromFlagsOrPackage ? 'development' : process.env.NODE_ENV || 'production';
export const isCI = ( remote && remote.getGlobal ) ? remote.getGlobal('isCI') :  process.env.CI;
export const travisOS = process.env.TRAVIS_OS_NAME || '';
//other considerations?
export const isHot = process.env.HOT || 0;


// const startAsMockNetwork = shouldStartAsMockFromFlagsOrPackage;
const startAsMockNetwork = shouldStartAsMockFromFlagsOrPackage ;

// only to be used for inital store setting in main process. Not guaranteed correct for renderers.
export const startedRunningMock = ( remote && remote.getGlobal ) ? remote.getGlobal('startedRunningMock') : startAsMockNetwork || /^dev/.test( env );
export const startedRunningProduction = !startedRunningMock;
export const isRunningNodeEnvTest = /^test/.test( env );
export const isRunningDebug = hasDebugFlag || isRunningSpectronTestProcess ;
export const inRendererProcess = typeof window !== 'undefined';
export const inMainProcess = typeof remote === 'undefined';

// Set global for tab preload.
// Adds app folder for asar packaging (space before app is important).
const preloadLocation = isRunningUnpacked ? '' : '../';


/**
 * retrieve the safe node lib path, either as a relative path in the main process,
 * or from the main process global
 * @return {[type]} [description]
 */
const safeNodeLibPath = ( ) =>
{
    //only exists in render processes
    if( remote && remote.getGlobal && !isRunningNodeEnvTest )
    {
        return remote.getGlobal('SAFE_NODE_LIB_PATH')
    }

    return path.resolve( __dirname, safeNodeAppPathModifier, 'node_modules/@maidsafe/safe-node-app/src/native' );
};

// HACK: Prevent jest dying due to no electron globals
const safeNodeAppPath = ( ) =>
{
    if ( !remote || !remote.app )
    {
        return '';
    }

    if( platform === WINDOWS )
    {
        return isRunningUnpacked ? [remote.process.execPath, remote.getGlobal('appDir')] : [remote.app.getPath( 'exe' )];
    }

    // mainjs portion needed for linux.
    return isRunningUnpacked ? [remote.process.execPath, `${remote.getGlobal('appDir')}/main.js`] : [remote.app.getPath( 'exe' )];
};

let safeNodeAppPathModifier = '';

if ( isRunningPackaged && !isRunningNodeEnvTest )
{
    safeNodeAppPathModifier = '../app.asar.unpacked/';
}


export const I18N_CONFIG = {
    locales        : ['en'],
    directory      : path.resolve( __dirname, 'locales' ),
    objectNotation : true
} ;

export const PROTOCOLS = {
    SAFE           : 'safe',
    SAFE_AUTH      : 'safe-auth',
    SAFE_LOGS      : 'safe-logs',
    INTERNAL_PAGES : 'peruse'
};

export const INTERNAL_PAGES = {
    HISTORY   : 'history',
    BOOKMARKS : 'bookmarks'
};

export const CONFIG = {
    PORT                 : 3984,
    SAFE_PARTITION       : 'persist:safe-tab',
    SAFE_NODE_LIB_PATH   : safeNodeLibPath(),
    APP_HTML_PATH        : path.resolve( __dirname, './app.html' ),
    DATE_FORMAT          : 'h:MM-mmm dd',
    NET_STATUS_CONNECTED : 'Connected',
    STATE_KEY            : 'peruseState',
    BROWSER_TYPE_TAG     : 8467,
    PRELOADED_MOCK_VAULT_PATH: path.join(__dirname, '..', 'PreloadDevVault')
};

if( inMainProcess )
{
    global.preloadFile = `file://${ __dirname }/webPreload.js`;
    global.appDir = __dirname;
    global.isCI = isCI;
    global.startedRunningMock = startedRunningMock;
    global.shouldStartAsMockFromFlagsOrPackage = shouldStartAsMockFromFlagsOrPackage;
    global.SAFE_NODE_LIB_PATH = CONFIG.SAFE_NODE_LIB_PATH;
    global.isRunningSpectronTestProcessingPackagedApp = isRunningSpectronTestProcessingPackagedApp;
    global.SPECTRON_TEST = isRunningSpectronTestProcess;
}



// if( isRunningUnpacked )
// {
//     CONFIG.CONFIG_PATH = path.resolve( __dirname, '../resources' );
// }




const appInfo = {
    info : {
        id             : pkg.identifier,
        scope          : null,
        name           : pkg.productName,
        vendor         : pkg.author.name,
        customExecPath : safeNodeAppPath()
    },
    opts : {
        own_container : true,
    },
    permissions : {
    },
};

// OSX: Add bundle for electron in dev mode
if ( isRunningUnpacked && process.platform === 'darwin' )
{
    appInfo.info.bundle = 'com.github.electron';
}
else if ( process.platform === 'darwin' )
{
    appInfo.info.bundle = 'com.electron.peruse';
}

export const APP_INFO = appInfo;

// TODO. Unify with test lib/constants browser UI?
export const CLASSES = {
    ACTIVE_TAB                : 'js-tabBar__active-tab',
    TAB                       : 'js-tab',
    ADD_TAB                   : 'js-tabBar__add-tab',
    CLOSE_TAB                 : 'js-tabBar__close-tab',
    PERUSE_PAGE               : 'js-peruse__page',
    SPECTRON_AREA             : 'js-spectron-area',
    SPECTRON_AREA__SPOOF_SAVE : 'js-spectron-area__spoof-save',
    SPECTRON_AREA__SPOOF_READ : 'js-spectron-area__spoof-read',
    NOTIFIER_TEXT             : 'js-notifier__text',

};
