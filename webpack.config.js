const path = require('path');
// Plugins
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const publicUrl = process.env.PUBLIC_URL || '';

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';

  // Specify the environment-specific .env file
  const envPath = isProduction ? '.env.production' : '.env.development';

  return {
    entry: './src/index.tsx',
    devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: path.resolve(__dirname, 'src'), // Include only the src directory
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: isDevelopment, // Enable cache in development mode
              plugins: isDevelopment ? ['react-refresh/babel'] : undefined, // Use React Refresh only in development
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        publicPath: publicUrl,
        templateParameters: {
          'PUBLIC_URL': publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
        }
      }),
      new CopyPlugin({
        patterns: [
          { from: 'public', to: './', globOptions: { ignore: ['**/index.html'] } },
        ],
      }),
      new Dotenv({
        path: envPath,
      }),
      new CleanWebpackPlugin(),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean), // Filter out false values in the plugins array
    devServer: {
      static: path.join(__dirname, 'public'),
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
    },
  };
};
