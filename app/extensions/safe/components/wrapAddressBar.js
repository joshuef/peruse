import React, { Component } from 'react';
// import styles from './browser.css';
import { CLASSES, isRunningSpectronTestProcess } from 'appConstants';
import { SAFE } from 'extensions/safe/constants';


export const wrapAddressbarButtons = ( AddressBarButtons, extensionFunctionality = {} ) =>
{
    return class wrappedAddressbarButtons extends Component {
        constructor(props) {
            super(props);
      }

      static defaultProps =
      {
          addressBarIsSelected : false,
          tabs                 : [],
          bookmarks            : [],
          notifications        : []
      }

      render() {
          const { peruseApp } = this.props;
          // const isMock = peruseApp ? peruseApp.isMock : false;

          return (
              <div>
                  <AddressBarButtons {...this.props}/>
              <span>Hibutton</span>
              </div>
          )
      }
    }
}
