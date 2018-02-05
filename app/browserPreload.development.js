import { push } from 'react-router-redux';
import logger from 'logger';

logger.verbose( 'Peruse Browser window preloaded.' );

window.peruseNav = ( location ) =>
{
    peruseStore.dispatch( push( location ) );
};
