import React, { Component } from 'react';
// import styles from './browser.css';
import { CLASSES, isRunningSpectronTestProcess } from 'appConstants';
import { SAFE } from 'extensions/safe/constants';
import { Column, IconButton, Row } from 'nessie-ui';
import logger from 'logger';
import styles from './webIdButtons.css'


export const wrapAddressbarButtons = ( AddressBarButtons, extensionFunctionality = {} ) =>
{
    return class wrappedAddressbarButtons extends Component {
        constructor(props) {
            super(props);
        }

        static defaultProps =
        {
            peruseApp            : {
                webIds: []
            }
        }

        handleIdClick = ( webId, event ) =>
        {
            const { setCurrentWebId } = this.props;
            setCurrentWebId( webId.id );
        }

        render() {
            const { peruseApp } = this.props;
            const { showingWebIdDropdown, webIds } = peruseApp;

            const handleIdClick = this.handleIdClick;

            const webIdDropdownContents = webIds.map( webId =>
            {
              if( webId.isSelected ){

                  return (
                      <li
                          onClick={ handleIdClick.bind( this, webId )  }
                          key={webId.id}
                          className={styles.selectedWebId}
                          >{ webId.name }
                      </li>
                  )
              }

              return ( <li
                  onClick={ handleIdClick.bind( this, webId ) }
                  key={webId.id}
                  className={styles.webId}
                  >
                      { webId.name }
                  </li> )
            });

            return (
                <Row gutters="S">
                    <Column>
                        <AddressBarButtons {...this.props}/>
                    </Column>
                    <Column>
                        <IconButton
                            iconTheme="light"
                            iconType="account"
                            iconSize="L"
                            />
                        {
                            showingWebIdDropdown &&
                            <ul className={styles.webIdList}>
                                { webIdDropdownContents }
                            </ul>
                        }
                    </Column>

                </Row>
            )
        }
    }
}
