// @flow
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import BrowserWindow from './containers/BrowserWindow';
import TrayWindow from './containers/TrayWindow';

// default route must come last
export default () => (
    <App>
        <Switch>
            <Route path="/tray" component={ TrayWindow } />
            <Route path="/" component={ BrowserWindow } />
        </Switch>
    </App>
);
