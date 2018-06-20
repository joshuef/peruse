const initialState = {
    authenticator : {
        isAuthorised        : false,
        userSecret          : null,
        userPassword        : null,
        inviteCode          : null,
        secretStrength      : 0,
        passwordStrength    : 0,
        error               : null,
        loading             : false,
        networkState        : 0, // Connecting
        authenticatorHandle : '',
        libStatus           : true,
        authenticationQueue : []
        // createAccNavPos: 1,
        // showPopupWindow: false,
        // libErrPopup: false

    },
    peruseApp : {
        appStatus       : null,
        networkStatus   : undefined,
        app             : null,
        readStatus      : '',
        authResponseUri : '',
        savedBeforeQuit : false,
        saveStatus      : '',
        isMock          : null,
        webIds          : [
            {
                name: 'Joshuef',
                nick: 'joshuef',
                inbox: [],
                pk:     '',
                isDefault: true
            },
            {
                name: 'Josh Wilson',
                nick: 'joshuef',
                inbox: [],
                pk:     '',
                isDefault: false
            }
        ]
    },
    webFetch : {
        fetching : false,
        link     : '',
        error    : null,
        options  : ''
    }
};

export default initialState;
