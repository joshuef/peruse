// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Link } from 'react-router';
import styles from './tabContents.css';
import Tab from 'components/Tab';
import { PROTOCOLS, INTERNAL_PAGES } from 'appConstants';
import History from 'components/PerusePages/History';
import Bookmarks from 'components/PerusePages/Bookmarks';
import UrlList from 'components/UrlList';

export default class TabContents extends Component
{
    getActiveTab()
    {
        return this.activeTab;
    }

    isInternalPage = ( tab ) =>
    {
        const urlObj = url.parse( tab.url );

        return urlObj.protocol === `${PROTOCOLS.INTERNAL_PAGES}:`;
    }

    render()
    {
        const { addTab, bookmarks, tabs, updateActiveTab, updateTab } = this.props;

        const tabComponents = tabs.map( ( tab, i ) =>
        {
            if ( !tab.isClosed )
            {
                if ( this.isInternalPage( tab ) )
                {
                    const urlObj = url.parse( tab.url );
                    const isActiveTab = tab.isActiveTab;

                    switch ( urlObj.host )
                    {
                        case INTERNAL_PAGES.HISTORY :
                        {
                            return ( <History
                                addTab={ addTab }
                                tabs={ tabs }
                                key={ i }
                                isActiveTab={ isActiveTab }
                                ref={ ( c ) => {
                                    if ( isActiveTab )
                                    {
                                        this.activeTab = c;
                                    }
                                } }
                            /> );
                        }
                        case INTERNAL_PAGES.BOOKMARKS :
                        {
                            return ( <Bookmarks
                                addTab={ addTab }
                                bookmarks={ bookmarks }
                                key={ i }
                                isActiveTab={ isActiveTab }
                                ref={ ( c ) => {
                                    if ( isActiveTab )
                                    {
                                        this.activeTab = c;
                                    }
                                } }
                            /> );
                        }

                        default :
                        {
                            return <div key="sorry">Sorry what?</div>;
                        }
                    }
                }

                const isActiveTab = tab.isActiveTab;
                const TheTab = ( <Tab
                    url={ tab.url }
                    isActiveTab={ isActiveTab }
                    addTab={ addTab }
                    updateTab={ updateTab }
                    updateActiveTab={ updateActiveTab }
                    key={ i }
                    index={ i }
                    ref={ ( c ) =>
                    {
                        if ( isActiveTab )
                        {
                            this.activeTab = c;
                        }
                    } }
                /> );
                return TheTab;
            }
        } );

        return (
            <div className={ styles.container }>
                { tabComponents }
            </div>
        );
    }
}
