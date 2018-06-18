import React, { Component } from 'react';

import logger from 'logger';
import { Column, IconButton, Row } from 'nessie-ui';

// import extendComponent from 'utils/extendComponent';
// import { wrapAddressBarButtonsLHS } from 'extensions/components';


export default class ButtonsLHS extends Component
{


    render = () =>
    {
        logger.verbose('Rendering Buttons LHS>>>>>>>>>>>>>>>>>>>>')
        const { handleBack, handleForward, handleRefresh } = this.props;

        <Row gutters="S">
            <Column>
                <IconButton
                    iconTheme="light"
                    iconType="left"
                    iconSize="L"
                    onClick={ handleBack }
                />
            </Column>
            <Column>
                <IconButton
                    iconTheme="light"
                    iconSize="L"
                    iconType="right"
                    onClick={ handleForward }
                />
            </Column>
            <Column>
                <IconButton
                    iconTheme="light"
                    iconSize="L"
                    iconType="reset"
                    onClick={ handleRefresh }
                />
            </Column>
        </Row>
    }
}

// export default extendComponent( ButtonsLHS, wrapAddressBarButtonsLHS );
