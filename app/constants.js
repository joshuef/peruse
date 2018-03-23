import path from 'path';
import { app } from 'electron';
import pkg from 'appPackage';

const allPassedArgs = process.argv;

let hasMockFlag = false;
let hasDebugFlag = false;

if( allPassedArgs.includes('--mock') )
{
    hasMockFlag = true;
}

if( allPassedArgs.includes('--debug') )
{
    hasDebugFlag = true;
}

export const isRunningUnpacked = !!process.execPath.match( /[\\/]electron/ );
export const isRunningPackaged = !isRunningUnpacked;
export const env = hasMockFlag ? 'development' : process.env.NODE_ENV || 'production';

//other considerations?
export const isRunningDebug = hasDebugFlag;
export const isHot = process.env.HOT || 0;

// only to be used for inital store setting in main process. Not guaranteed correct for renderers.
export const isRunningMock = /^dev/.test( env );
export const isRunningProduction = !isRunningMock;
export const isRunningTest = /^test/.test( env );
export const isRunningSpectronTest = !!process.env.IS_SPECTRON;
export const inRendererProcess = typeof window !== 'undefined';
export const inMainProcess = !inRendererProcess;

// Set global for tab preload.
// Adds app folder for asar packaging (space before app is important).
const preloadLocation = isRunningUnpacked ? '' : '../';
global.preloadFile = `file://${ __dirname }/webPreload.js`;

let safeNodeAppPathModifier = '';

if ( isRunningPackaged )
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
    SAFE_NODE_LIB_PATH   : path.resolve( __dirname, safeNodeAppPathModifier, 'node_modules/@maidsafe/safe-node-app/src/native' ),
    APP_HTML_PATH        : path.resolve( __dirname, './app.html' ),
    DATE_FORMAT          : 'h:MM-mmm dd',
    NET_STATUS_CONNECTED : 'Connected',
    STATE_KEY            : 'peruseState',
    BROWSER_TYPE_TAG     : 8467
};


if( isRunningUnpacked )
{
    CONFIG.CONFIG_PATH = path.resolve( __dirname, '../resources' );
}

// HACK: Prevent jest dying due to no electron globals
const execPath = ( ) =>
{
    if ( env === 'test' || inRendererProcess )
    {
        return '';
    }

    return isRunningUnpacked ? [process.execPath, app.getAppPath()] : [app.getPath( 'exe' )];
};

const appInfo = {
    info : {
        id             : pkg.identifier,
        scope          : null,
        name           : pkg.productName,
        vendor         : pkg.author.name,
        customExecPath : execPath()
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


export const SAFE = {
    APP_STATUS : {
        TO_AUTH              : 'TO_AUTH',
        AUTHORISED           : 'AUTHORISED',
        AUTHORISING          : 'AUTHORISING',
        AUTHORISATION_FAILED : 'AUTHORISATION_FAILED',
        AUTHORISATION_DENIED : 'AUTHORISATION_DENIED',

        TO_LOGOUT   : 'TO_LOGOUT',
        LOGGING_OUT : 'LOGGING_OUT',
        LOGGED_OUT  : 'LOGGED_OUT',

        READY : 'READY'
    },
    ACCESS_CONTAINERS : {
        PUBLIC       : '_public',
        PUBLIC_NAMES : '_publicNames',
    },
    NETWORK_STATE : {
        INIT         : 'Init',
        CONNECTED    : 'Connected',
        UNKNOWN      : 'Unknown',
        DISCONNECTED : 'Disconnected',
        LOGGED_IN    : 'LOGGED_IN',
    },
    READ_STATUS :
    {
        READING              : 'READING',
        READ_SUCCESSFULLY    : 'READ_SUCCESSFULLY',
        READ_BUT_NONEXISTANT : 'READ_BUT_NONEXISTANT',
        FAILED_TO_READ       : 'FAILED_TO_READ',
        TO_READ              : 'TO_READ'
    },
    SAVE_STATUS :
    {
        SAVING             : 'SAVING',
        SAVED_SUCCESSFULLY : 'SAVED_SUCCESSFULLY',
        FAILED_TO_SAVE     : 'FAILED_TO_SAVE',
        TO_SAVE            : 'TO_SAVE'
    }
};

export const SAFE_APP_ERROR_CODES = {
    ERR_AUTH_DENIED       : -200,
    ENTRY_ALREADY_EXISTS  : -107,
    ERR_NO_SUCH_ENTRY     : -106,
    ERR_DATA_EXISTS       : -104,
    ERR_DATA_NOT_FOUND    : -103,
    ERR_OPERATION_ABORTED : -14
};

export const SAFE_MESSAGES = {
    INITIALIZE : {
        AUTHORISE_APP       : 'Authorising Application',
        CHECK_CONFIGURATION : 'Checking configuration'
    },
    AUTHORISATION_ERROR       : 'Failed to authorise',
    AUTHORISATION_DENIED      : 'The authorisation request was denied',
    CHECK_CONFIGURATION_ERROR : 'Failed to retrieve configuration'
};
