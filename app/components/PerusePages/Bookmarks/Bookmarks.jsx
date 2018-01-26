// @flow
import React, { Component } from 'react';
// import { Link } from 'react-router';
import { ipcRenderer, remote } from 'electron';
import PropTypes from 'prop-types';

import { Page, H1, PageHeader } from 'nessie-ui';
import UrlList from 'components/UrlList';
import styles from './bookmarks.css';
import { CLASSES } from 'appConstants';

const log = require( 'electron-log' );


export default class Bookmarks extends Component
{
    static propTypes =
    {
        bookmarks : PropTypes.array.isRequired,
        addTab : PropTypes.func.isRequired
    }

    static defaultProps =
    {
        bookmarks : []
    }

    render()
    {
        const { bookmarks, isActiveTab, addTab } = this.props;
        const bookmarkList = bookmarks.map( bookmark => bookmark.url );

        let moddedClass = styles.tab;
        if ( isActiveTab )
        {
            moddedClass = styles.activeTab;
        }

        return (
            <div className={ moddedClass } >
                <div className={ `${styles.container}` } >
                    <Page
                        className={ `${CLASSES.PERUSE_PAGE} ${styles.page}` }
                    >
                        <PageHeader>
                            <H1 title="Bookmarks" />
                        </PageHeader>
                        <UrlList list={ bookmarkList } addTab={ addTab } />
                    </Page>


                </div>
            </div>
        );
    }
}
