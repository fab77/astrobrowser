import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const PATHS = {
  entryPoint4Browser: path.resolve(__dirname, 'src/index.js'),
  bundles: path.resolve(__dirname, '_bundles'),
}


var browserConfig = {
  entry: {
    'fabviewer': [PATHS.entryPoint4Browser],
    'fabviewer.min': [PATHS.entryPoint4Browser]
  },
  target: 'web',
  externals: {},
  output: {
    path: PATHS.bundles,
    libraryTarget: 'umd',
    library: 'fabviewer',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs']
    }
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^node:/,
      (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      },
    ),
    new CopyPlugin({
      patterns: [
        { from: "src/media", to: "images" },
        { from: "src/css", to: "stylesheets" }
      ],
    }),
  ],
  module: {

    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        // use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      //   {
      //     test: /\.(ts|tsx)$/i,
      //     use: 'ts-loader',
      //     exclude: ["/node_modules/"],
      //   },
    ],
  }
}

export default (env, argv) => {
  return [browserConfig];
};


