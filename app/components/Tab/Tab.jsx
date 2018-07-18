// @flow
import { remote, ipcRenderer } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { addTrailingSlashIfNeeded, removeTrailingSlash, urlHasChanged } from 'utils/urlHelpers';
import path from 'path';
import { parse as parseURL } from 'url';
import styles from './tab.css';
import logger from 'logger';

const { Menu, MenuItem } = remote;

// drawing on itch browser meat: https://github.com/itchio/itch/blob/3231a7f02a13ba2452616528a15f66670a8f088d/appsrc/components/browser-meat.js
const WILL_NAVIGATE_GRACE_PERIOD = 3000;
const SHOW_DEVTOOLS = parseInt( process.env.DEVTOOLS, 10 ) > 1;

export default class Tab extends Component
{
    static propTypes =
    {
        isActiveTab          : PropTypes.bool.isRequired,
        url                  : PropTypes.string.isRequired,
        index                : PropTypes.number.isRequired,
        isActiveTabReloading : PropTypes.bool.isRequired,
        closeTab             : PropTypes.func.isRequired,
        updateTab            : PropTypes.func.isRequired,
        addTab               : PropTypes.func.isRequired,
        pageLoaded           : PropTypes.func.isRequired,
    }

    static defaultProps =
    {
        isActiveTab : false,
        url         : 'http://nowhere.com',

    }


    constructor( props )
    {
        super( props );

        this.state = {
            browserState : {
                canGoBack       : false,
                canGoForward    : false,
                loading         : true,
                mountedAndReady : false,
                url             : '',
                redirects       : []
            }
        };

        // this.domReady = ::this.domReady;
        this.goBack = ::this.goBack;
        this.goForward = ::this.goForward;
        this.reload = ::this.reload;
        this.stop = ::this.stop;
        this.openDevTools = ::this.openDevTools;
        this.loadURL = ::this.loadURL;
        this.reloadIfActive = ::this.reloadIfActive;
    }

    isDevToolsOpened = () =>
    {
        const { webview } = this;

        if ( webview )
        {
            return webview.isDevToolsOpened();
        }
    }

    reloadIfActive()
    {
        const { isActiveTab, pageLoaded } = this.props;
        if ( !isActiveTab )
        {
            return;
        }

        this.reload();
        pageLoaded();
    }

    componentDidMount()
    {
        const { webview } = this;
        let rightClickPosition;


        const menu = Menu.buildFromTemplate( [
            { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
            { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
            { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
            { type: 'separator' },
            { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' },
            {
                label : 'Inspect element',
                click : ( e ) =>
                {
                    webview.inspectElement( rightClickPosition.x, rightClickPosition.y );
                }
            }
        ] );

        const callbackSetup = () =>
        {
            webview.addEventListener( 'did-start-loading', ::this.didStartLoading );
            webview.addEventListener( 'did-stop-loading', ::this.didStopLoading );
            webview.addEventListener( 'will-navigate', ::this.willNavigate );
            webview.addEventListener( 'did-navigate', ::this.didNavigate );
            webview.addEventListener( 'did-navigate-in-page', ::this.didNavigateInPage );
            webview.addEventListener( 'did-get-redirect-request', ::this.didGetRedirectRequest );
            webview.addEventListener( 'page-title-updated', ::this.pageTitleUpdated );
            webview.addEventListener( 'page-favicon-updated', ::this.pageFaviconUpdated );
            webview.addEventListener( 'new-window', ::this.newWindow );
            webview.addEventListener( 'did-fail-load', ::this.didFailLoad );

            webview.addEventListener( 'contextmenu', ( e ) =>
            {
                e.preventDefault();
                rightClickPosition = { x: e.x, y: e.y };
                menu.popup( remote.getCurrentWindow() );
            }, false );

            this.domReady();

            webview.removeEventListener( 'dom-ready', callbackSetup );
        };

        webview.src = 'about:blank';

        webview.addEventListener( 'dom-ready', callbackSetup );

        webview.addEventListener( 'dom-ready', () =>
        {
            this.didStopLoading();
        } );
    }

    componentWillReceiveProps( nextProps )
    {
        if ( JSON.stringify( nextProps ) === JSON.stringify( this.props ) )
        {
            return;
        }

        if ( !this.state.browserState.mountedAndReady )
        {
            return;
        }

        logger.silly( 'Webview: did receive updated props' );

        if ( nextProps.url )
        {
            const { webview } = this;

            if ( !webview ) return;

            if ( webview.src === '' || webview.src === 'about:blank' ||
                urlHasChanged(webview.src, nextProps.url ) )
            {
                this.loadURL( nextProps.url );
            }
        }

        if (nextProps.isActiveTabReloading) {
            this.reloadIfActive();
        }
    }

    updateBrowserState( props = {} )
    {
        const { webview } = this;
        if ( !webview )
        {
            return;
        }
        if ( !webview.partition || webview.partition === '' )
        {
            console.warn( `${this.props.index}: webview has empty partition` );
        }

        const browserState = {
            ...this.state.browserState,
            canGoBack    : webview.canGoBack(),
            canGoForward : webview.canGoForward(),
            ...props
        };

        this.setState( { browserState } );
    }

    domReady()
    {
        const { url } = this.props;
        const { webview } = this;

        const webContents = webview.getWebContents();
        if ( !webContents || webContents.isDestroyed() ) return;

        if ( SHOW_DEVTOOLS )
        {
            webContents.openDevTools( { detach: true } );
        }

        this.updateBrowserState( { loading: false, mountedAndReady: true } );

        if ( url && url !== 'about:blank' )
        {
            this.loadURL( url )
                .catch( err => console.log( 'err in loadurl', err ) );
        }
    }

    didStartLoading( )
    {
        logger.silly( 'webview started loading' );
        const { updateTab, index, isActiveTab } = this.props;

        const tabUpdate = {
            index,
            isLoading: true
        };

        this.updateBrowserState( { loading: true } );
        updateTab( tabUpdate );
    }

    didFailLoad( )
    {
      const { url, index, addTab, closeTab } = this.props;
      closeTab( { index } );
      addTab( { url, isActiveTab: true } );
    }

    didStopLoading( )
    {
        const { updateTab, index, isActiveTab } = this.props;

        const tabUpdate = {
            index,
            isLoading: false
        };

        this.updateBrowserState( { loading: false } );
        updateTab( tabUpdate );
    }

    pageTitleUpdated( e )
    {
        logger.silly( 'Webview: page title updated' );

        const title = e.title;
        const { updateTab, index, isActiveTab } = this.props;

        const tabUpdate = {
            title, index
        };

        updateTab( tabUpdate );
    }

    pageFaviconUpdated( e )
    {
        logger.silly( 'Webview: page favicon updated' );
        // const {index, tabDataFetched} = this.props
        // tabDataFetched(index, {webFavicon: e.favicons[0]})
    }

    didNavigate( e )
    {
        const { updateTab, index } = this.props;
        const { url } = e;
        const noTrailingSlashUrl = removeTrailingSlash( url );

        logger.silly( 'webview did navigate' );

        // TODO: Actually overwrite history for redirect
        if ( !this.state.browserState.redirects.includes( url ) )
        {
            this.updateBrowserState( { url, redirects: [url] } );
            updateTab( { index, url } );
        }
    }

    didNavigateInPage( e )
    {
        const { updateTab, index } = this.props;
        const { url } = e;
        const noTrailingSlashUrl = removeTrailingSlash( url );

        logger.silly( 'Webview: did navigate in page' );

        // TODO: Actually overwrite history for redirect
        if ( !this.state.browserState.redirects.includes( url ) )
        {
            this.updateBrowserState( { url, redirects: [url] } );
            updateTab( { index, url } );
        }
    }

    didGetRedirectRequest( e )
    {
        const { oldURL, newURL } = e;

        const prev = oldURL;
        const next = newURL;

        logger.silly( 'Webview: did get redirect request' );


        if ( prev === this.state.browserState.url )
        {
            this.updateBrowserState( { redirects: [next] } );
        }
    }

    willNavigate( e )
    {
        logger.silly( 'webview will navigate', e );

        if ( !this.isFrozen() )
        {
            return;
        }

        const { url } = e;
        const { webview } = this;
        if ( this.lastNavigationUrl === url && e.timeStamp - this.lastNavigationTimeStamp < WILL_NAVIGATE_GRACE_PERIOD )
        {

            this.with( ( ) =>
            {
                webview.stop();
                this.loadURL( url );
            } );
            return;
        }
        this.lastNavigationUrl = url;
        this.lastNavigationTimeStamp = e.timeStamp;

        const index = this.props.index;

        this.props.updateTab( { index, url } );

        if ( this.props.isActiveTab )
        {
            this.props.updateActiveTab( { url } );
        }


        // our own little preventDefault
        // cf. https://github.com/electron/electron/issues/1378
        this.with( ( wv ) =>
        {
            webview.stop();
            this.loadURL( url );
        } );
    }

    newWindow( e )
    {
        const { addTab } = this.props;
        const { url } = e;
        // navigate('url/' + url)
        const activateTab = e.disposition == 'foreground-tab';

        addTab( { url, isActiveTab: activateTab } );

        this.goForward();
    }

    isFrozen( e )
    {
        const { index } = this.props;
        const frozen = !index;
        // const frozen = staticTabData[index] || !index
        return frozen;
    }

    with( cb, opts = { insist: false } )
    {
        const { webview } = this;
        if ( !webview ) return;

        const webContents = webview.getWebContents();
        if ( !webContents )
        {
            return;
        }

        if ( webContents.isDestroyed() ) return;

        cb( webview, webContents );
    }

    openDevTools()
    {
        this.with( ( wv, wc ) => wc.openDevTools( { detach: true } ) );
    }

    stop()
    {
        this.with( ( wv ) => wv.stop() );
    }

    reload()
    {
        logger.silly( 'webview reloading' );

        this.with( ( wv ) =>
        {
            wv.reload();
        } );
    }

    goBack( e )
    {
        this.with( ( wv ) => wv.goBack() );
    }

    goForward()
    {
        console.warn( 'Electron bug preventing goForward: https://github.com/electron/electron/issues/9999' );
        this.with( ( wv ) => wv.goForward() );
    }

    loadURL = async ( input ) =>
    {

        const { webview } = this;
        const url = addTrailingSlashIfNeeded( input );
        logger.silly( 'Webview: loading url:', url );

        if ( !urlHasChanged( this.state.browserState.url, url) )
        {
            logger.verbose( 'not loading URL as it has not changed');
            return;
        }

        const browserState = { ...this.state.browserState, url };
        this.setState( { browserState } );


        // prevent looping over attempted url loading
        if ( webview && url !== 'about:blank' )
        {
            webview.loadURL( url );
        }
    }


    render()
    {
        const { isActiveTab } = this.props;

        const preloadFile = remote.getGlobal( 'preloadFile' );
        const injectPath = preloadFile; // js we'll be chucking in

        let moddedClass = styles.tab;
        if ( isActiveTab )
        {
            moddedClass = styles.activeTab;
        }

        return (
            <div className={ moddedClass } >
                <webview
                    style={ { height: '100%', display: 'flex', flex: '1 1' } }
                    preload={ injectPath }
                    partition='persist:safe-tab'
                    ref={ ( c ) =>
                    {
                        this.webview = c;
                    } }
                />
            </div>
        );
    }
}
