const path = require('path')
const react = require('@neutrinojs/react')
const copy = require('@neutrinojs/copy')
const wext = require('neutrino-webextension')

module.exports = {
  options: {
    mains: {
      content: {
        entry: 'content',
        webext: {
          type: 'content_scripts',
          manifest: {
            matches: ['<all_urls>']
          }
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
              '19': 'assets/icon-19.png',
              '38': 'assets/icon-38.png'
            }
          }
        }
      },

      options: {
        entry: 'options',
        webext: {
          type: 'options_ui',
          manifest: {
            open_in_tab: true
          }
        }
      },

      background: {
        entry: 'background',
        webext: {
          type: 'background'
        }
      }
    }
  },
  use: [
    react({
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
            }
          },
          {
            loader: 'sass-loader',
            useId: 'scss'
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
        ]
      }
    }),
    copy({
      patterns: [
        { context: 'assets', from: '**/*', to: 'assets', toType: 'dir' }
      ]
    }),
    neutrino => {
      /* eslint-disable indent */
      // prettier-ignore
      neutrino.config
        .resolve
          .extensions
            .add('.ts')
            .add('.tsx')
            .end()
          .alias
            .set('@', path.join(__dirname, 'src'))
      /* eslint-enable indent */
    },
    wext({
      polyfill: true
    })
  ]
}
