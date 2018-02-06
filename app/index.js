// import 'raf/polyfill';
import React from 'react';
import { render } from 'react-dom';
// import { ipcRenderer } from 'electron';
import { AppContainer } from 'react-hot-loader';
// import { syncHistoryWithStore } from 'react-router-redux';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

const log = require( 'electron-log' );


log.info( 'Starting render process' );
window.onerror = function ( error, url, line )
{
    log.error( error );
    log.error( url );
    log.error( line );
};

const store = configureStore();
// const history = syncHistoryWithStore( hashHistory, store );
window.peruseStore = store;

render(
    <AppContainer>
        <Root store={ store } history={ history } />
    </AppContainer>,
    document.getElementById( 'root' )
);

if ( module.hot )
{
    module.hot.accept( './containers/Root', () =>
    {
        const NextRoot = require( './containers/Root' ); // eslint-disable-line global-require
        render(
            <AppContainer>
                <NextRoot store={ store } history={ history } />
            </AppContainer>,
            document.getElementById( 'root' )
        );
    } );
}
