const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const DEFAULT_API_URL = 'http://localhost:3000/api';

const resolveApiOrigin = (apiUrl) => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return null;
  }
};

module.exports = (_, argv = {}) => {
  const mode = argv.mode || 'development';
  const apiUrl = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  const apiOrigin = resolveApiOrigin(apiUrl);
  const connectSources = new Set(["'self'"]);

  if (apiOrigin) {
    connectSources.add(apiOrigin);
  }

  connectSources.add('http://localhost:3000');
  connectSources.add('http://127.0.0.1:3000');

  return {
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
            loader: 'ts-loader'
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
        react$: path.resolve(__dirname, 'node_modules/react'),
        'react-dom$': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-dom/client$': path.resolve(__dirname, 'node_modules/react-dom/client.js'),
        'react/jsx-runtime$': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
        'react/jsx-dev-runtime$': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
        'react-router$': path.resolve(__dirname, 'node_modules/react-router'),
        'react-router-dom$': path.resolve(__dirname, 'node_modules/react-router-dom')
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        meta: {
          'Content-Security-Policy': {
            'http-equiv': 'Content-Security-Policy',
            'content': `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src ${Array.from(connectSources).join(' ')};`
          },
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      }),
      new webpack.DefinePlugin({
        'process.env.REACT_APP_TOKEN_KEY': JSON.stringify(process.env.REACT_APP_TOKEN_KEY || 'kukuza_token'),
        'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
        'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(process.env.REACT_APP_SUPABASE_URL || ''),
        'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY || ''),
        'process.env.REACT_APP_ENABLE_API_MOCKS': JSON.stringify(
          process.env.REACT_APP_ENABLE_API_MOCKS || 'true'
        )
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: 3003,
      hot: true,
      open: true
    }
  };
};
