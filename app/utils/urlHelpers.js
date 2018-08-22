import { parse } from 'url';
import path from 'path';
import pkg from 'appPackage';
import logger from 'logger';
import { PROTOCOLS } from 'appConstants';

export const isInternalPage = ( tab ) =>
{
    const urlObj = parse( tab.url );

    return urlObj.protocol === `${PROTOCOLS.INTERNAL_PAGES}:`;
};

export const removeTrailingSlash = ( url ) =>
{
    if ( url )
    {
        return url.replace( /\/$/, '' );
    }

    return url;
};

export const removeLeadingSlash = ( url ) =>
{
    if ( url )
    {
        return url.replace( /^\//, '' );
    }

    return url;
};

export const trimSlashes = ( url ) =>
{
    let newUrl = removeLeadingSlash( url )
    newUrl = removeTrailingSlash( newUrl )
    return newUrl;
};


export const addTrailingSlashIfNeeded = ( url ) =>
{
    const urlObj = parse( url );
    const urlPath = urlObj.path;
    let extName;

    if ( urlPath )
    {
        extName = path.extname( urlPath );
    }

    let slashedUrl = url;

    if ( urlPath && !urlObj.hash && !extName && !urlPath.endsWith( '/' ) )
    {
        slashedUrl += '/';
    }

    return slashedUrl;
};

export const removeTrailingHash = ( url ) =>
    url.replace( /\#$/, '' );

export const removeTrailingRedundancies = ( url ) =>
{
    let newUrl = url.replace( /index\.html$/, '' );
    newUrl = newUrl.replace( /index$/, '' );
    newUrl = removeTrailingSlash( newUrl );
    newUrl = removeTrailingHash( newUrl );

    // loop until clean
    if ( newUrl === url )
    {
        return newUrl;
    }

    return removeTrailingRedundancies( newUrl );
};

export const urlHasChanged = ( src, newUrl ) =>
{
    const strippedSrcUrl = removeTrailingRedundancies( src );
    const strippedNewUrl = removeTrailingRedundancies( newUrl );

    const parsedSrc = parse( src );
    const parsedNew = parse( newUrl );

    // console.log('parsedSrc', parsedSrc)
    // console.log('parsedNew', parsedNew)

    if ( strippedNewUrl === strippedSrcUrl )
    {
        return false;
    }

    if ( parsedSrc.protocol !== parsedNew.protocol ||
        parsedSrc.host !== parsedNew.host ||
        removeTrailingSlash( parsedSrc.path ) !== removeTrailingSlash( parsedNew.path ) )
    {
        return true;
    }

    // here we leave the slashes on hashes up to the app/user
    const srcHash = parsedSrc.hash ? trimSlashes( parsedSrc.hash.replace('#', '') ) : '';
    const newHash = parsedNew.hash? trimSlashes( parsedNew.hash.replace('#', '') ) : '';

    if ( srcHash !== newHash )
    {
        return true;
    }

    return false;
};

const getProtocolPosition = ( url, inputProtocol ) =>
{
    const fullProto = '://';
    const shortProto = ':';

    let protocolPos;

    if ( url.indexOf( fullProto ) > -1 )
    {
        protocolPos = url.indexOf( fullProto ) + 3;
    }
    else
    {
        protocolPos = url.indexOf( shortProto );
    }

    return protocolPos;
};
/**
 * Takes input and adds requisite url portions as needed, comparing to package.json defined
 * protocols, or defaulting to http.
 *
 * Strips trailling slashes/hashses for clarity in the address bar
 * @param  {String} input address bar input
 * @return {String}       full url with protocol and any trailing (eg: http:// / .com)
 */
export const makeValidAddressBarUrl = ( input ) =>
{
    if ( !input )
    {
        return 'about:blank';
        logger.warn( 'url must be a string' );
    }

    const validProtocols = pkg.build.protocols.schemes || ['http'];
    const parsedURL = parse( input );
    const inputProtocol = parsedURL.protocol ? parsedURL.protocol.replace( ':', '' ) : '';

    let finalProtocol;
    let everythingAfterProtocol = '';
    const protocolPos = getProtocolPosition( input, inputProtocol );

    if ( validProtocols.includes( inputProtocol ) )
    {
        finalProtocol = inputProtocol;

        everythingAfterProtocol = input.substring(
            protocolPos,
            input.length );
    }
    else if ( !inputProtocol )
    {
        finalProtocol = validProtocols[0];
        everythingAfterProtocol = input;
    }
    else if ( inputProtocol === 'localhost' && parsedURL.hostname )
    {
        const port = parsedURL.hostname;
        const lengthOfSemiColon = 1;

        finalProtocol = 'http';

        everythingAfterProtocol = input.substring(
            protocolPos + port.length + lengthOfSemiColon,
            input.length );

        everythingAfterProtocol = `localhost:${parsedURL.hostname}/${everythingAfterProtocol}`;
    }
    else if ( inputProtocol )
    {
        // TODO: Show error page for bad urls.
        return removeTrailingRedundancies( input );
    }

    const endUrl = `${finalProtocol}://${everythingAfterProtocol}`;

    return removeTrailingRedundancies( endUrl );
};
