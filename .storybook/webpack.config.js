const path = require('path')
const fs = require('fs')
const Neutrino = require('neutrino/Neutrino')
const neutrinorc = require('../.neutrinorc.js')
const neutrino = new Neutrino(neutrinorc.options)
neutrinorc.use.forEach(middleware => neutrino.use(middleware))

const babelOptions = neutrino.config.module
  .rule('compile')
  .use('babel')
  .get('options')

// babelOptions.plugins.push([
//   'babel-plugin-react-docgen-typescript',
//   {
//     docgenCollectionName: 'STORYBOOK_REACT_CLASSES',
//     include: 'components.*\\.tsx$',
//     exclude: '__mocks__|(\\.stories\\.tsx$)'
//   }
// ])

const sassGlobals = fs
  .readdirSync(path.join(__dirname, '../src/_sass_shared/_global/'))
  .map(filename => path.join(__dirname, '../src/_sass_shared/_global/', filename))

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.mjs$/,
    type: 'javascript/auto'
  })
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: babelOptions
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'),
        options: {
          tsconfigPath: path.join(__dirname, '../tsconfig.json')
        }
      }
    ]
  })
  config.module.rules.push({
    oneOf: [
      {
        test: /\.module\.(css|scss)$/,
        use: [
          'to-string-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')]
            }
          },
          'sass-loader'
        ],
        include: path.resolve(__dirname, '../src')
      },
      {
        test: /\.shadow\.(css|scss)$/,
        use: [
          'to-string-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'clean-css-loader',
            options: {
              level: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')]
            }
          },
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              sourceMap: true,
              resources: sassGlobals
            }
          }
        ],
        include: path.resolve(__dirname, '../src')
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'to-string-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')]
            }
          },
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              sourceMap: true,
              resources: sassGlobals
            }
          }
        ],
        include: path.resolve(__dirname, '../src')
      }
    ]
  })

  if (Array.isArray(config.entry)) {
    config.entry.unshift('webextensions-emulator/dist/core')
  } else {
    Object.keys(config.entry).forEach(id => {
      if (!Array.isArray(config.entry[id])) {
        config.entry[id] = [config.entry[id]]
      }
      config.entry[id].unshift('webextensions-emulator/dist/core')
    })
  }

  config.resolve.extensions.push('.ts', '.tsx')
  config.resolve.alias['@'] = path.join(__dirname, '../src')
  config.resolve.alias['@sb'] = path.join(__dirname)

  return config
}
