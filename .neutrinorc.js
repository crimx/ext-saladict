const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const react = require('@neutrinojs/react')
const copy = require('@neutrinojs/copy')
const jest = require('@neutrinojs/jest')
const wext = require('neutrino-webextension')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const dotenv = require('dotenv')
const argv = require('yargs').argv
const AfterBuildPlugin = require('./scripts/after-build')
const svgToMiniDataURI = require('mini-svg-data-uri')
const isAnalyze = argv.analyze || argv.analyse

module.exports = {
  options: {
    mains: {
      content: {
        entry: 'content',
        webext: {
          type: 'content_scripts',
          manifest: {
            css: ['assets/content.css'],
            matches: ['<all_urls>']
          },
          setup: 'content/__fake__/env.ts'
        }
      },

      selection: {
        entry: 'selection',
        webext: {
          type: 'content_scripts',
          manifest: {
            match_about_blank: true,
            all_frames: true,
            matches: ['<all_urls>']
          }
        }
      },

      popup: {
        entry: 'popup',
        webext: {
          type: 'browser_action',
          manifest: {
            default_icon: {
              '16': 'assets/icon-16.png',
              '19': 'assets/icon-19.png',
              '24': 'assets/icon-24.png',
              '38': 'assets/icon-38.png',
              '48': 'assets/icon-48.png',
              '128': 'assets/icon-128.png'
            }
          },
          setup: 'popup/__fake__/env.ts'
        }
      },

      options: {
        entry: 'options',
        webext: {
          type: 'options_ui',
          manifest: {
            open_in_tab: true
          },
          setup: 'options/__fake__/env.ts'
        }
      },

      background: {
        entry: 'background',
        webext: {
          type: 'background',
          setup: 'background/__fake__/env.ts'
        }
      },

      notebook: {
        entry: 'notebook'
      },

      history: {
        entry: 'history'
      },

      'quick-search': {
        entry: 'quick-search'
      },

      'word-editor': {
        entry: 'word-editor'
      },

      'audio-control': {
        entry: 'audio-control'
      }
    }
  },
  use: [
    react({
      html: {
        title: 'Saladict'
      },
      image: false,
      style: {
        test: /\.(css|scss)$/,
        modulesTest: /\.module\.(css|scss)$/,
        loaders: [
          // Define loaders as objects. Note: loaders must be specified in reverse order.
          // ie: for the loaders below the actual execution order would be:
          // input file -> sass-loader -> postcss-loader -> css-loader -> style-loader/mini-css-extract-plugin
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')]
            },
            useId: 'postcss'
          },
          {
            loader: 'sass-loader',
            useId: 'scss'
          },
          {
            loader: 'sass-resources-loader',
            useId: 'sass-resources',
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              resources: fs
                .readdirSync(path.join(__dirname, 'src/_sass_shared/_global/'))
                .map(filename =>
                  path.join(__dirname, 'src/_sass_shared/_global/', filename)
                )
            }
          }
        ]
      },
      babel: {
        presets: [
          [
            '@babel/preset-env',
            {
              /* remove targets set by neutrino web preset preferring browserslistrc */
            }
          ],
          [
            '@babel/preset-typescript',
            {
              isTSX: true,
              allExtensions: true
            }
          ]
        ],
        plugins: [
          [
            'import',
            {
              libraryName: 'antd'
            },
            'antd'
          ],
          [
            'import',
            {
              libraryName: '@ant-design/icons',
              libraryDirectory: '',
              camel2DashComponentName: false,
              style: false
            },
            '@ant-design/icons'
          ]
        ]
      }
    }),
    copy({
      patterns: [
        { context: 'assets', from: '**/*', to: 'assets/', toType: 'dir' },
        {
          context: 'src/_locales/manifest',
          from: '**/*',
          to: '_locales/',
          toType: 'dir'
        },
        {
          context: 'node_modules/antd/dist/',
          from: '+(antd|antd.dark).min.css',
          to: 'assets/',
          toType: 'dir'
        },
        // caiyunapp
        {
          context: 'node_modules/trsjs/build/sala',
          from: 'trs.js',
          to: 'assets/',
          toType: 'dir'
        }
      ]
    }),
    neutrino => {
      /* eslint-disable indent */

      // images
      neutrino.config.module.rules
        .delete('image')
        .end()
        .rule('svg')
        .test(/\.(svg)(\?v=\d+\.\d+\.\d+)?$/)
        .use('svg-url')
        .loader(require.resolve('url-loader'))
        .options({
          limit: 8192,
          // remove `default` when `require` image
          // due to legacy code
          esModule: false,
          generator: content => svgToMiniDataURI(content.toString())
        })
        .end()
        .end()
        .rule('pixel')
        .test(/\.(ico|png|jpg|jpeg|gif|webp)(\?v=\d+\.\d+\.\d+)?$/)
        .use('img-url')
        .loader(require.resolve('file-loader'))
        .options({
          // dev-server image name collision
          name: resourcePath => {
            if (process.env.NODE_ENV === 'development') {
              return '[path]/[name].[ext]'
            }

            const dictMatch = /\/dictionaries\/([^/]+)\/favicon.png/.exec(
              resourcePath
            )
            if (dictMatch) {
              return `assets/favicon-${dictMatch[1]}.[contenthash:8].[ext]`
            }

            return 'assets/[name].[contenthash:8].[ext]'
          },
          limit: 0,
          esModule: false
        })

      // avoid collision
      neutrino.config.output.jsonpFunction('saladictEntry')

      // transform *.shadow.(css|scss) to string
      // this will be injected into shadow-dom style tag
      // prettier-ignore
      const shadowStyleRules = neutrino.config.module
        .rule('style')
          .oneOf('shadow')
            .before('normal')
            .test(/\.shadow\.(css|scss)$/)
              .use('tostring')
                .loader('to-string-loader')
                .end()
              .use('minify')
              .after('css')
                .loader('clean-css-loader')
                .options({
                  level: 1,
                })
                .end()
      // copy loaders from normal to shadow
      // prettier-ignore
      neutrino.config.module
        .rule('style')
          .oneOf('normal')
            .uses.values()
              .filter(rule => !/^(extract|style)$/.test(rule.name))
              .forEach(rule => {
                shadowStyleRules
                  .use(rule.name)
                    .loader(rule.get('loader'))
                    .options(rule.get('options'))
              })

      // prettier-ignore
      neutrino.config
        .module
          .rule('compile') // add ts extensions for babel ect
            .test(/\.(mjs|jsx|js|ts|tsx)$/)
            .end()
          .end()
        .resolve
          .extensions // typescript extensions
            .add('.ts')
            .add('.tsx')
            .end()
          .alias // '@' src alias
            .set('@', path.join(__dirname, 'src'))
            .end()
          .end()

      // remove locales
      neutrino.config
        .plugin('momentjs')
          .use(MomentLocalesPlugin, [{ localesToKeep: ['zh-cn', 'zh-tw'] }])
          .end()

      // prettier-ignore
      neutrino.config
        .plugin('process.env')
          .use(webpack.DefinePlugin, [{
            'process.env': JSON.stringify(Object.assign(
                { DEBUG: !!argv.debug },
                dotenv.config().parsed
              ))
          }])
      /* eslint-enable indent */

      if (argv.mode === 'production') {
        // prettier-ignore
        neutrino.config
          .performance
            .hints(false)
            .end()
          .optimization
            .merge({
              splitChunks: {
                cacheGroups: {
                  react: {
                    test: /[\\/]node_modules[\\/](react|react-dom|i18next)[\\/]/,
                    name: 'view-vendor',
                    chunks: 'all',
                    priority: 100
                  },
                  franc: {
                    test: /[\\/]node_modules[\\/]franc/,
                    name: 'franc',
                    chunks: 'all',
                    priority: 100
                  },
                  dexie: {
                    test: /[\\/]node_modules[\\/]dexie/,
                    name: 'dexie',
                    chunks: 'all',
                    priority: 100
                  },
                  wordpage: {
                    test: (module, chunks) => module.resource &&
                      module.resource.includes(`${path.sep}src${path.sep}`) &&
                      !module.resource.includes(`${path.sep}node_modules${path.sep}`),
                    name: 'wordpage',
                    chunks: ({ name }) => /^(notebook|history)$/.test(name),
                  },
                  antd: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'antd',
                    chunks: ({ name }) => /^(options|notebook|history)$/.test(name),
                  }
                }
              },
            })
      }

      if (argv.debug) {
        // prettier-ignore
        neutrino.config
          .devtool('inline-source-map')
          .optimization
            .minimize(false)
      }

      if (isAnalyze) {
        // prettier-ignore
        neutrino.config
          .plugin('bundle-analyze')
          .use(BundleAnalyzerPlugin);
      }
    },
    jest({
      testRegex: ['test/specs/.*\\.spec\\.(ts|tsx|js|jsx)'],
      setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      transform: {
        '\\.(mjs|jsx|js|ts|tsx)$': require.resolve(
          '@neutrinojs/jest/src/transformer'
        )
      },
      testTimeout: 20000
    }),
    wext({
      polyfill: true
    }),
    neutrino => {
      // prettier-ignore
      neutrino.config
        .plugin('after-build')
        .use(AfterBuildPlugin);
    }
  ]
}
