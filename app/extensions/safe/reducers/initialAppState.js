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
                id: 1,
                inbox: [],
                pk:     '',
                isDefault: true,
                isSelected : true
            },
            {
                name: 'Josh Wilson',
                nick: 'not joshuef',
                id: 2,
                inbox: [],
                pk:     '',
                isDefault: false,
                isSelected : false

            }
        ],
        showingWebIdDropdown : true
    },
    webFetch : {
        fetching : false,
        link     : '',
        error    : null,
        options  : ''
    }
};

export default initialState;
