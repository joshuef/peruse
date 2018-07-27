// @flow
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import PropTypes from 'prop-types';
import MdStar from 'react-icons/lib/md/star';
import MdStarOutline from 'react-icons/lib/md/star-outline';
import { Column, IconButton, Row, InputField } from 'nessie-ui';
import logger from 'logger';


import styles from './addressBar.css';

export default class AddressBar extends Component
{
    static propTypes =
    {
        address        : PropTypes.string,
        isSelected     : PropTypes.bool,
        activeTab      : PropTypes.object,
        windowId       : PropTypes.number.isRequired,
        isBookmarked   : PropTypes.bool.isRequired,
        addBookmark    : PropTypes.func.isRequired,
        removeBookmark : PropTypes.func.isRequired,
        onBlur         : PropTypes.func.isRequired,
        onSelect       : PropTypes.func.isRequired,
        onFocus        : PropTypes.func.isRequired,
        reloadPage     : PropTypes.func.isRequired,
    }

    static defaultProps =
    {
        address    : '',
        isSelected : false,
        editingUrl : false
    }

    constructor( props )
    {
        super( props );
        this.handleChange = ::this.handleChange;
        this.handleKeyPress = ::this.handleKeyPress;

        this.state = {
            address : props.address
        };
    }


    componentWillReceiveProps( nextProps )
    {
        if ( nextProps.address !== this.props.address && nextProps.address !== this.state.address )
        {
            this.setState( { address: nextProps.address, editingUrl: false } );
        }

        if ( nextProps.isSelected  && !this.props.isSelected && !this.state.editingUrl && this.addressInput )
        {
            this.addressInput.select();
        }
    }

    isInFocussedWindow = ( ) =>
    {
        const BrowserWindow = remote.BrowserWindow;
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if( !focusedWindow )
        {
            return false;
        }

        const focussedWindowId = BrowserWindow.getFocusedWindow().id;
        const currentWindowId = remote.getCurrentWindow().id;

        return focussedWindowId === currentWindowId;
    }

    handleBookmarking = ( tabData, event ) =>
    {
        const { address, addBookmark, removeBookmark, isBookmarked } = this.props;

        if ( isBookmarked )
        {
            removeBookmark( { url: address } );
        }
        else
        {
            addBookmark( { url: address } );
        }
    }

    handleBack = ( tabData, event ) =>
    {
        const { activeTabBackwards } = this.props;
        activeTabBackwards();
    }

    handleForward = ( tabData, event ) =>
    {
        const { activeTabForwards } = this.props;
        activeTabForwards();
    }

    handleRefresh = ( event ) =>
    {
        // TODO: if cmd or so clicked, hard.
        event.stopPropagation();
        const { reloadPage } = this.props;
        reloadPage();
    }

    handleClick = ( event ) =>
    {
        const { onSelect, isSelected } = this.props;

        if( isSelected )
        {
            this.setState( { editingUrl: true } );
            onSelect();
        }

    }

    handleChange( event )
    {
        const { onSelect } = this.props;

        this.setState( { editingUrl: true, address: event.target.value } );

        if ( onSelect )
        {
            onSelect();
        }
    }

    handleFocus = ( event ) =>
    {
        const { onFocus } = this.props;

        onFocus();
        event.target.select();
    }

    handleBlur = ( ) =>
    {
        const { onBlur } = this.props;
        onBlur();
    }

    handleKeyPress( event )
    {
        const { windowId } = this.props;
        if ( event.key !== 'Enter' )
        {
            return;
        }

        const input = event.target.value;

        logger.info('UPDATING ACTIVE TAB WITH WINDOWIFFF', windowId )
        this.props.updateActiveTab( { url: input, windowId } );
    }

    render()
    {
        const { address } = this.state;
        const { isSelected, isBookmarked, activeTab } = this.props;

        return (
            <div className={ `${styles.container} js-address` } >
                <Row align="left" verticalAlign="middle" gutters="S">
                    <Column size="content">
                        <Row gutters="S">
                            <Column>
                                <IconButton
                                    iconTheme="light"
                                    iconType="left"
                                    iconSize="L"
                                    onClick={ this.handleBack }
                                />
                            </Column>
                            <Column>
                                <IconButton
                                    iconTheme="light"
                                    iconSize="L"
                                    iconType="right"
                                    onClick={ this.handleForward }
                                />
                            </Column>
                            <Column>
                              <IconButton
                                  iconTheme="light"
                                  iconSize="L"
                                  iconType="reset"
                                  isDisabled={ activeTab.isLoading }
                                  onClick={ this.handleRefresh }
                              />
                            </Column>
                        </Row>
                    </Column>
                    <Column className={ styles.addressBarColumn }>
                        <InputField
                            className={ 'js-address__input' }
                            value={ address }
                            type="text"
                            inputRef={ ( input ) =>
                            {
                                this.addressInput = input;

                                if ( isSelected && ! this.state.editingUrl &&
                                    this.isInFocussedWindow() && input )
                                {
                                    input.select();
                                }
                            } }
                            onFocus={ this.handleFocus }
                            onBlur={ this.handleBlur }
                            onChange={ this.handleChange }
                            onKeyPress={ this.handleKeyPress }
                        />
                    </Column>
                    <Column size="content">
                        <Row gutters="S">
                            <Column align="left">
                                {
                                    isBookmarked &&
                                        <MdStar className={styles.buttonIcon} onClick={this.handleBookmarking}/>
                                }
                                {
                                    ! isBookmarked &&
                                        <MdStarOutline className={styles.buttonIcon} onClick={this.handleBookmarking}/>
                                }
                            </Column>
                        </Row>
                    </Column>
                </Row>
            </div>
        );
    }
}
