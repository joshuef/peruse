/**
 * Webpack config for production electron main process
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import baseConfig from './webpack.config.base';

export default merge.smart( baseConfig, {
    devtool : 'source-map',

    target : 'electron-main',
    mode   : 'production',

    entry : ['babel-polyfill', './app/main.development'],

    // 'main.js' in root
    output : {
        path     : __dirname,
        filename : './app/main.js'
    },

    stats : 'errors-only',

    plugins : [

        /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
        new webpack.DefinePlugin( {
            'process.env.NODE_ENV' : JSON.stringify( process.env.NODE_ENV || 'production' )
        } )
    ],

    /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
    node : {
        __dirname  : false,
        __filename : false
    },
} );
