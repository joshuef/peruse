/* eslint global-require: 0, import/no-dynamic-require: 0 */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import merge from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 1214;
const publicPath = `http://localhost:${port}/dist`;
const dll = path.resolve( process.cwd(), 'dll' );
const manifest = path.resolve( dll, 'vendor.json' );


/**
 * Warn if the DLL is not built
 */
if ( !( fs.existsSync( dll ) && fs.existsSync( manifest ) ) )
{
    console.log( chalk.black.bgYellow.bold(
        'The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'
    ) );
    execSync( 'npm run build-dll' );
}

export default merge.smart( baseConfig, {
    devtool : 'inline-source-map',

    target : 'electron-renderer',

    entry : [
        'react-hot-loader/patch',
        `webpack-dev-server/client?http://localhost:${port}/`,
        'webpack/hot/only-dev-server',
        path.join( __dirname, 'app/index.js' ),
    ],

    output : {
        publicPath : `http://localhost:${port}/dist/`
    },

    plugins : [
        new webpack.DllReferencePlugin( {
            context    : process.cwd(),
            manifest   : require( manifest ),
            sourceType : 'var',
        } ),

        /**
     * https://webpack.js.org/concepts/hot-module-replacement/
     */
        new webpack.HotModuleReplacementPlugin( {
            multiStep : true
        } ),

        new webpack.NoEmitOnErrorsPlugin(),

        /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
        new webpack.DefinePlugin( {
            'process.env.NODE_ENV'    : JSON.stringify( process.env.NODE_ENV || 'development' ),
            'process.env.IS_UNPACKED' : JSON.stringify( 'true' )
        } ),

        new webpack.LoaderOptionsPlugin( {
            debug : true
        } ),

        new ExtractTextPlugin( {
            filename : '[name].css'
        } )
    ],

    devServer : {
        port,
        publicPath,
        compress     : true,
        noInfo       : true,
        stats        : 'errors-only',
        inline       : true,
        lazy         : false,
        hot          : true,
        headers      : { 'Access-Control-Allow-Origin': '*' },
        contentBase  : path.join( __dirname, 'dist' ),
        watchOptions : {
            aggregateTimeout : 300,
            poll             : 100
        },
        historyApiFallback : {
            verbose        : true,
            disableDotRule : false,
        },
        before()
        {
            spawn(
                'npm',
                ['run', 'build-preload'],
                { shell: true, env: process.env, stdio: 'inherit' }
            ).on( 'error', spawnError => console.error( spawnError ) );

            spawn(
                'npm',
                ['run', 'build-browserPreload'],
                { shell: true, env: process.env, stdio: 'inherit' }
            ).on( 'error', spawnError => console.error( spawnError ) );


            spawn(
                'npm',
                ['run', 'build-bg'],
                { shell: true, env: process.env, stdio: 'inherit' }
            )
                .on( 'close', code =>
                {
                    if ( process.env.START_HOT )
                    {
                        spawn(
                            'npm',
                            ['run', 'start-hot-renderer'],
                            { shell: true, env: process.env, stdio: 'inherit' }
                        )
                            .on( 'close', code => process.exit( code ) )
                            .on( 'error', spawnError => console.error( spawnError ) );
                    }
                } )
                .on( 'error', spawnError => console.error( spawnError ) );
        }
    },
} );
