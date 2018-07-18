import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode : 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader' 
          }, {
            loader: 'css-loader?sourceMap' 
          }, {
            loader: 'resolve-url-loader' 
          }, {
            loader: 'sass-loader?sourceMap' 
          }
        ]
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/, use: 'url-loader?limit=500000' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, 'app.html'), to: './' },
      { from: path.resolve(__dirname, 'favicon.png'), to: './' }
    ])
  ]
};
