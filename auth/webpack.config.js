const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react$: path.resolve(__dirname, '../node_modules/react'),
      'react-dom$': path.resolve(__dirname, '../node_modules/react-dom'),
      'react-dom/client$': path.resolve(__dirname, '../node_modules/react-dom/client.js'),
      'react/jsx-runtime$': path.resolve(__dirname, '../node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime$': path.resolve(__dirname, '../node_modules/react/jsx-dev-runtime.js'),
      'react-router$': path.resolve(__dirname, '../node_modules/react-router'),
      'react-router-dom$': path.resolve(__dirname, '../node_modules/react-router-dom')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      meta: {
        'Content-Security-Policy': {
          'http-equiv': 'Content-Security-Policy',
          'content': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' " + (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000') + ";"
        },
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_TOKEN_KEY': JSON.stringify(process.env.REACT_APP_TOKEN_KEY || 'kukuza_token'),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'),
      'process.env.REACT_APP_JWT_SECRET': JSON.stringify(process.env.REACT_APP_JWT_SECRET || 'kukuza_dev_secret_key_change_in_production_12345')
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3001,
    hot: true,
    open: true
  }
};
