import { push } from 'react-router-redux';
import logger from 'logger';
import rpc from 'pauls-electron-rpc';
import { PROTOCOLS } from 'appConstants';
import setupPreloadAPIs from './setupPreloadAPIs';;

logger.verbose( 'Peruse Browser window preloaded.' );

window.peruseNav = ( location ) =>
{
    if( peruseStore )
    {
        peruseStore.dispatch( push( location ) );
    }
    else
    {
        window.perusePendingNavigation = location;
    }
};


setupPreloadAPIs( `${PROTOCOLS.SAFE_AUTH}:` );
