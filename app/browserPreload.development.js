import { push } from 'react-router-redux';
import logger from 'logger';

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
