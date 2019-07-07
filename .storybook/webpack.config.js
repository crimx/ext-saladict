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
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: path.resolve(__dirname, '../src')
  })
  config.resolve.extensions.push('.ts', '.tsx')
  config.resolve.alias['@'] = path.join(__dirname, '../src')
  return config
}
