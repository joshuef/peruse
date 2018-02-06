// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import * as TabActions from 'actions/tabs_actions';
// import * as NotificationActions from 'actions/notification_actions';
import * as UiActions from 'actions/ui_actions';
// import * as BookmarksActions from 'actions/bookmarks_actions';
// import * as SafeActions from 'actions/safe_actions';

import { TextInput } from 'nessie-ui';


class BrowserWindow extends Component
{
    render()
    {
        return (
            <div>
                <TextInput label="secret"/>
                <TextInput label="pass"/>
            </div>
        );
    }
}

function mapStateToProps( state )
{
    return {
        // bookmarks : state.bookmarks,
        notifications : state.notifications,
        // tabs          : state.tabs,
        ui            : state.ui
    };
}

function mapDispatchToProps( dispatch )
{
    const actions =
        {
            // ...BookmarksActions,
            // ...NotificationActions,
            // ...TabActions,
            ...UiActions,
            // ...SafeActions
        };
    return bindActionCreators( actions, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( BrowserWindow );
