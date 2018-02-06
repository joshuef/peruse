const initialState = {
    bookmarks     : [{ url: 'safe-auth://home/#/login' }],
    notifications : [
    ],
    safeNetwork : {
        appStatus       : null,
        networkStatus   : null,
        app             : null,
        tasks           : [],
        readStatus      : '',
        savedBeforeQuit : false,
        saveStatus      : '',
        networkType     : ''
    },
    tabs : [{
        url          : 'safe-auth://home/',
        history      : ['safe-auth://home/'],
        historyIndex : 0,
        index        : 0,
        isActiveTab  : true,
        isClosed     : false
    }],
    ui : {
        addressBarIsSelected : false
    }
};

export default initialState;
