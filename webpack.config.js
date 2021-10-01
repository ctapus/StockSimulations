const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    indexIntraday: './src/indexIntraday.ts',
    summary: './src/summary.ts'
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, './public/scripts'),
    filename: './[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
      new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          jquery: 'jquery'
      })
  ],
  devServer: {
      compress: true,
      host: process.env.HOST,
      port: process.env.PORT,
      open: ['/index.html'],
      client: {
        overlay: true,
      },
    }
};