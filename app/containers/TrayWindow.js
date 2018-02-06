// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import * as TabActions from 'actions/tabs_actions';
// import * as NotificationActions from 'actions/notification_actions';
import * as UiActions from 'actions/ui_actions';
import * as AuthenticatorActions from 'actions/authenticator_actions';
// import * as BookmarksActions from 'actions/bookmarks_actions';
// import * as SafeActions from 'actions/safe_actions';
import { SAFE } from 'appConstants';
import { TextInput } from 'nessie-ui';


class BrowserWindow extends Component
{
    handleKeyPress = ( event ) =>
    {
        const { login } = this.props;
        console.log('keyyypressss', login );
        if ( event.key !== 'Enter' )
        {
            return;
        }

        const secret = this.secret.value;
        const password = this.password.value;

        console.log('s n p', secret, password );

        login( secret, password );

        // this.props.updateActiveTab( { url: input } );
    }

    render()
    {
        const { safeNetwork } = this.props;

        const loggedIn = safeNetwork.appStatus === SAFE.NETWORK_STATE.LOGGED_IN;

        return (
            <div>
                {
                    loggedIn &&
                        <h2> Logged in. Refresh your auth page. </h2>
                }
                {
                    !loggedIn &&
                        <div>
                            <TextInput
                                onKeyPress={ this.handleKeyPress }
                                label="secret"
                                inputRef={ ( input ) =>
                                    {
                                        this.secret = input;
                                    } }
                            />
                            <TextInput
                                onKeyPress={ this.handleKeyPress }
                                label="secret"
                                inputRef={ ( input ) =>
                                    {
                                        this.password = input;
                                    } }
                            />
                        </div>
                }
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
        ui            : state.ui,
        safeNetwork            : state.safeNetwork,
    };
}

function mapDispatchToProps( dispatch )
{
    const actions =
        {
            // ...BookmarksActions,
            // ...NotificationActions,
            // ...TabActions,
            ...AuthenticatorActions,
            ...UiActions,
            // ...SafeActions
        };
    return bindActionCreators( actions, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( BrowserWindow );
