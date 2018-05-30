'use strict'

const fs = require('fs')
const path = require('path')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const getClientEnvironment = require('./env')
const paths = require('./paths')
const argv = require('minimist')(process.argv.slice(2))
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const JsConfigPathsPlugin = require('jsconfig-paths-webpack-plugin')
const WrapperPlugin = require('wrapper-webpack-plugin')

const fackBgEnv = fs.readFileSync(require.resolve('./fake-env/webextension-background.js'), 'utf8')

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/'
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = ''
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

const [entryBg, entryPage] = ['background', argv.main || 'popup']
  .map(name => {
    const dirPath = path.join(paths.appSrc, name)
    if (!fs.existsSync(dirPath) || !fs.lstatSync(dirPath).isDirectory()) {
      return {name, dirPath: ''}
    }

    let indexJS = ''
    let indexHTML = ''

    const fakeDirPath = path.join(dirPath, '__fake__')
    if (fs.existsSync(fakeDirPath) && fs.lstatSync(fakeDirPath).isDirectory()) {
      const fakeFiles = fs.readdirSync(fakeDirPath)
      indexJS = fakeFiles.find(name => /index\.((t|j)sx?)$/.test(name))
      indexHTML = fakeFiles.find(name => name === 'index.html')
      if (indexJS) { indexJS = path.join('__fake__', indexJS) }
      if (indexHTML) { indexHTML = path.join('__fake__', indexHTML) }
    }

    if (!indexJS || !indexHTML) {
      const names = fs.readdirSync(dirPath)
      if (!indexJS) {
        indexJS = names.find(name => /index\.((t|j)sx?)$/.test(name))
      }
      if (!indexHTML) {
        indexHTML = names.find(name => name === 'index.html')
      }
    }

    return {
      name,
      dirPath,
      indexJS,
      indexHTML,
    }
  })

if (!entryPage.dirPath) {
  throw new Error(`No folder ${path.join(paths.appSrc, entryPage.name)}`)
}
if (!entryPage.indexJS) {
  throw new Error(`Missing entry file for ${entryPage.dirPath}`)
}
console.log(path.join(entryPage.dirPath, entryPage.indexHTML))
if (!fs.existsSync(path.join(entryPage.dirPath, entryPage.indexHTML))) {
  throw new Error(`Missing entry HTML for ${entryPage.dirPath}`)
}

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: {
    env: [
      require.resolve('./fake-env/webextension-page.js'),
      require.resolve('./fake-env/fake-ajax.js'),
    ],
    page: [
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      // require.resolve('webpack-dev-server/client') + '?/',
      // require.resolve('webpack/hot/dev-server'),
      require.resolve('react-dev-utils/webpackHotDevClient'),
      // Finally, this is your app's code.
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
      path.join(entryPage.dirPath, entryPage.indexJS)
    ],
    background: path.join(entryBg.dirPath, entryBg.indexJS)
  },
  // ].concat(entries.map(x => path.join(x.dirPath, x.indexJS))),
  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/[name].js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: ['.ts', '.tsx', '.vue', '.js', '.json', '.jsx'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      'vue$': 'vue/dist/vue.runtime.esm.js',
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      new JsConfigPathsPlugin(),
      new TsConfigPathsPlugin(),
    ],
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[ext]',
            },
          },
          {
            test: /\.tsx?$/,
            include: paths.appSrc,
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  cacheDirectory: true,
                },
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  transpileOnly: true,
                },
              }
            ],
          },
          // Process JS with Babel.
          {
            test: /\.jsx?$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
            },
          },
          {
            test: /\.vue$/,
            loader: require.resolve('vue-loader'),
            options: {
              loaders: {
                css: genStyleLoaders('css', true),
                scss: genStyleLoaders('scss', true),
              },
              cssSourceMap: true,
              // If you have problems debugging vue-files in devtools,
              // set this to false - it *may* help
              // https://vue-loader.vuejs.org/en/options.html#cachebusting
              cacheBusting: false,
              transformToRequire: {
                video: ['src', 'poster'],
                source: 'src',
                img: 'src',
                image: 'xlink:href'
              },
              esModule: true
            }
          },
          {
            test: /\.scss$/,
            use: genStyleLoaders('scss', false),
          },
          {
            test: /\.css$/,
            use: genStyleLoaders('css', false),
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            //
            // Also exclude files under test for fake dev env
            exclude: [/\.js$/, /\.html$/, /\.json$/, /test/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[ext]',
            },
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin({tslint: true}),
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(entryPage.dirPath, entryPage.indexHTML),
      chunks: ['env', 'background', 'page'],
      chunksSortMode: 'manual',
    }),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Tailor locales
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(en|zh-cn|zh-tw)$/),
    new WrapperPlugin({
      test: /background\.js$/,
      header: ';(function () {\n' + fackBgEnv + '\n',
      footer: '\n})();'
    })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
}

// "postcss" loader applies autoprefixer to our CSS.
// "css" loader resolves paths in CSS and adds assets as dependencies.
// "style" loader turns CSS into JS modules that inject <style> tags.
// In production, we use a plugin to extract that CSS to a file, but
// in development "style" loader enables hot editing of CSS.
function genStyleLoaders (format, isVue) {
  var result = [
    {
      loader: isVue ? 'vue-style-loader' : 'style-loader',
      options: { sourceMap: true },
    },
    {
      loader: 'css-loader',
      options: { sourceMap: true },
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: true },
    },
  ]

  if (format === 'scss') {
    result.push({
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        includePaths: [path.resolve(__dirname, '../node_modules')],
      },
    })
  }
  return result
}
