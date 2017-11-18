// hacky build, for development

const shell = require('shelljs')
shell.env.NODE_ENV = 'production'

const glob = require('glob')
const fs = require('fs')
var path = require('path')
var ora = require('ora')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'js': [{
              loader: 'babel-loader',
              options: {presets: []}
            }],
            'css': ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: ['css-loader', 'postcss-loader']
            }),
            'scss': ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: ['css-loader', 'postcss-loader', 'sass-loader', {
                loader: 'sass-resources-loader',
                options: {
                  resources: ['src/sass-global/**/*.scss']
                }
              }]
            })
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, '../src')
        ],
        exclude: /node_modules/,
        options: {
          presets: []
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader', {
            loader: 'sass-resources-loader',
            options: {
              resources: ['src/sass-global/**/*.scss']
            }
          }]
        })
      }
    ]
  }
})

webpackConfig = merge(webpackConfig, {
  devtool: '#source-map',
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    // tailor locales
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(en|zh-cn|zh-tw|zh-hk)$/),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      chunks: ['popup', 'panel', 'options', 'shareimg'],
      minChunks: 2
    }),
    // extract css into its own file
    new ExtractTextPlugin('[name].css'),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/template.html',
      chunks: ['commons', 'popup'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackPlugin({
      filename: 'panel.html',
      template: 'src/template.html',
      chunks: ['commons', 'panel'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackPlugin({
      filename: 'history.html',
      template: 'src/template.html',
      chunks: ['history'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackPlugin({
      filename: 'shareimg.html',
      template: 'src/template.html',
      chunks: ['commons', 'shareimg'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'src/template.html',
      chunks: ['commons', 'options'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new BundleAnalyzerPlugin()
  ]
})

console.log(
  '  Tip:\n' +
  '  Built files are meant to be served over an HTTP server.\n' +
  '  Opening index.html over file:// won\'t work.\n'
)

var spinner = ora('building for production...')
spinner.start()

var distPath = path.resolve(__dirname, '../dist')
var assetsPath = path.resolve(distPath, 'assets')
shell.rm('-rf', distPath)
shell.mkdir('-p', distPath)
// shell.rm('-rf', assetsPath)
shell.mkdir('-p', assetsPath)
shell.cp('-R', 'assets/static/*', assetsPath)
shell.mkdir('-p', path.join(assetsPath, 'dicts'))
glob(path.join(__dirname, '../src/dictionaries/**/favicon.png'), (err, files) => {
  if (err) { console.error(err) }
  files.forEach(file => {
    fs.readFile(file, (err, data) => {
      if (err) { console.error(err) }
      fs.writeFile(path.join(assetsPath, 'dicts', `${path.basename(path.dirname(file))}.png`), data)
    })
  })
})
require('./dicts/_locales.js')
// shell.cp('-R', 'src/_locales', distPath)
shell.cp('src/manifest.json', distPath)

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})
