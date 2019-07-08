const path = require('path')
const Neutrino = require('neutrino/Neutrino')
const neutrinorc = require('../.neutrinorc.js')
const neutrino = new Neutrino(neutrinorc.options)
neutrinorc.use.forEach(middleware => neutrino.use(middleware))

const babelOptions = neutrino.config.module
  .rule('compile')
  .use('babel')
  .get('options')

babelOptions.plugins.push([
  'babel-plugin-react-docgen-typescript',
  {
    docgenCollectionName: 'STORYBOOK_REACT_CLASSES',
    include: 'components.*\\.tsx$',
    exclude: '__mocks__|(\\.stories\\.tsx$)'
  }
])

module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: babelOptions
  })
  config.module.rules.push({
    oneOf: [
      {
        test: /\.module\.(css|scss)$/,
        use: [
          'style-loader',
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
          'sass-loader'
        ],
        include: path.resolve(__dirname, '../src')
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
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
          'sass-loader'
        ],
        include: path.resolve(__dirname, '../src')
      }
    ]
  })

  config.resolve.extensions.push('.ts', '.tsx')
  config.resolve.alias['@'] = path.join(__dirname, '../src')

  return config
}
