// var path = require('path')
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
            'css': ExtractTextPlugin.extract({
              fallback: {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: false
                }
              },
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: false
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: false
                  }
                }
              ]
            }),
            'scss': ExtractTextPlugin.extract({
              fallback: {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: false
                }
              },
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: false
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: false
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: false
                  }
                },
                {
                  loader: 'sass-resources-loader',
                  options: {
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
        exclude: /node_modules\/(?!(get-stream|url-regex)\/).*/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'vue-style-loader',
            options: {
              sourceMap: false
            }
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false
              }
            }
          ]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'vue-style-loader',
            options: {
              sourceMap: false
            }
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'sass-resources-loader',
              options: {
                resources: ['src/sass-global/**/*.scss']
              }
            }
          ]
        })
      }
    ]
  },
  devtool: false
})

webpackConfig = merge(webpackConfig, {
  devtool: false,
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
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
    // split vendor js into its own file
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module, count) {
    //     // any required modules inside node_modules are extracted to vendor
    //     return (
    //       module.resource &&
    //       /\.js$/.test(module.resource) &&
    //       module.resource.indexOf(
    //         path.join(__dirname, '../node_modules')
    //       ) === 0
    //     )
    //   }
    // }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   chunks: ['vendor']
    // })
  ]
})

// if (config.build.productionGzip) {
//   var CompressionWebpackPlugin = require('compression-webpack-plugin')

//   webpackConfig.plugins.push(
//     new CompressionWebpackPlugin({
//       asset: '[path].gz[query]',
//       algorithm: 'gzip',
//       test: new RegExp(
//         '\\.(' +
//         config.build.productionGzipExtensions.join('|') +
//         ')$'
//       ),
//       threshold: 10240,
//       minRatio: 0.8
//     })
//   )
// }

module.exports = webpackConfig
