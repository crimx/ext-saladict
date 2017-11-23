// var path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const isDevBuild = process.env.BUILD_ENV === 'devproduction'

const webpackConfig = merge(baseWebpackConfig, {
  devtool: isDevBuild ? '#source-map' : false,
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'css': ExtractTextPlugin.extract({
              fallback: {
                loader: 'vue-style-loader', options: { sourceMap: isDevBuild }
              },
              use: [
                { loader: 'css-loader', options: { sourceMap: isDevBuild } },
                { loader: 'postcss-loader', options: { sourceMap: isDevBuild } }
              ]
            }),
            'scss': ExtractTextPlugin.extract({
              fallback: {
                loader: 'vue-style-loader', options: { sourceMap: isDevBuild }
              },
              use: [
                { loader: 'css-loader', options: { sourceMap: isDevBuild } },
                { loader: 'postcss-loader', options: { sourceMap: isDevBuild } },
                { loader: 'sass-loader', options: { sourceMap: isDevBuild } },
                { loader: 'sass-resources-loader',
                  options: {
                    sourceMap: isDevBuild,
                    resources: ['src/sass-global/**/*.scss']
                  }
                }
              ]
            })
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'vue-style-loader', options: { sourceMap: isDevBuild }
          },
          use: [
            { loader: 'css-loader', options: { sourceMap: isDevBuild } },
            { loader: 'postcss-loader', options: { sourceMap: isDevBuild }
            }
          ]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'vue-style-loader', options: { sourceMap: isDevBuild }
          },
          use: [
            { loader: 'css-loader', options: { sourceMap: isDevBuild } },
            { loader: 'postcss-loader', options: { sourceMap: isDevBuild } },
            { loader: 'sass-loader', options: { sourceMap: isDevBuild } },
            { loader: 'sass-resources-loader',
              options: {
                sourceMap: isDevBuild,
                resources: ['src/sass-global/**/*.scss']
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isDevBuild ? '"development"' : '"production"'
      }
    }),
    // tailor locales
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(en|zh-cn|zh-tw|zh-hk)$/),
    (
      isDevBuild
        ? null
        : new UglifyJsPlugin({
          uglifyOptions: {
            ie8: false,
            ecma: 6,
            drop_console: true,
            output: {
              comments: false,
              beautify: false
            },
            warnings: false
          }
        })
    ),
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
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
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
  ].filter(Boolean)
})

module.exports = webpackConfig
