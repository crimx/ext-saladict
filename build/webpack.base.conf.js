const path = require('path')

module.exports = {
  entry: {
    background: './src/background/main.js',

    content: './src/content/page/main.js',
    selection: './src/content/page/selection-listener.js',
    panel: './src/content/panel/main.js',

    popup: './src/popup/main.js',
    shareimg: './src/shareimg/main.js',
    history: './src/history/main.js',
    notebook: './src/notebook/main.js',
    options: './src/options/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[ext]'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.*', '.js', '.vue', '.json'],
    alias: {
      'test': path.resolve(__dirname, '../test'),
      'src': path.resolve(__dirname, '../src')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
