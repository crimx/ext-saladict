'use strict'

const fs = require('fs')
const path = require('path')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const paths = require('./paths')
const getClientEnvironment = require('./env')
const argv = require('minimist')(process.argv.slice(2))
const rxPaths = require('rxjs/_esm2015/path-mapping')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const JsConfigPathsPlugin = require('jsconfig-paths-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './'
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1)
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.')
}

// Note: defined here because it will be used more than once.
const cssFilename = '[name].css'

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {}

// Every folder in app src would generate a entry
// except 'manifest', 'assets','components', 'typings' and name starts with '_'
const entries = fs.readdirSync(paths.appSrc)
  .filter(name => !name.startsWith('_'))
  .map(name => ({name, dirPath: path.join(paths.appSrc, name)}))
  .filter(({name, dirPath}) => !/^assets|components|manifest|typings|app-config$/.test(name) && fs.lstatSync(dirPath).isDirectory())

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: shouldUseSourceMap ? 'source-map' : false,
  // In production, we only want to load the polyfills and the app code.
  entry: entries.reduce((result, {name, dirPath}) => {
    const names = fs.readdirSync(dirPath)
    const indexFile = names.find(name => /index\.((t|j)sx?)$/.test(name))
    if (!indexFile) { throw new Error(`Missing entry file for ${dirPath}`) }
    result[name] = [require.resolve('./polyfills'), path.join(dirPath, indexFile)]
    return result
  }, {}),
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
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
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.vue'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      'vue$': 'vue/dist/vue.runtime.esm.js',
      ...rxPaths(),
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
          // "url" loader works just like "file" loader but it also embeds
          // assets smaller than specified size as data URLs to avoid requests.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/[name].[ext]',
            },
          },
          {
            test: /\.tsx?$/,
            include: paths.appSrc,
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  compact: true,
                },
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  appendTsSuffixTo: [/\.vue$/],
                  // transpileOnly: argv.devbuild,
                  transpileOnly: !!argv.notypecheck,
                }
              }
            ],
          },
          // Process JS with Babel.
          {
            test: /\.jsx?$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              compact: true,
            },
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                css: genStyleLoaders('css', true),
                scss: genStyleLoaders('scss', true),
              },
              cssSourceMap: shouldUseSourceMap,
              // If you have problems debugging vue-files in devtools,
              // set this to false - it *may* help
              // https://vue-loader.vuejs.org/en/options.html#cachebusting
              cacheBusting: true,
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
            loader: genStyleLoaders('scss', false),
          },
          {
            test: /\.css$/,
            loader: genStyleLoaders('css', false),
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/[name].[ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [
    argv.devbuild
    ? null
    : new ForkTsCheckerWebpackPlugin({tslint: true, async: false}),
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    ...entries.map(({name, dirPath}) => ({name, dirPath, template: path.join(dirPath, 'index.html')}))
      .filter(({template}) => fs.existsSync(template))
      .map(({name, template}) => new HtmlWebpackPlugin({
        inject: true,
        filename: name + '.html',
        chunks: [name],
        template,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      })),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    // RxJs https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md
    argv.devbuild
    ? null
    : new webpack.optimize.ModuleConcatenationPlugin(),
    // Minify the code.
    argv.devbuild
    ? null
    : new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 7,
        compress: {
          // Harmony Bug
          // https://github.com/mishoo/UglifyJS2/issues/2842
          inline: false,
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
          ascii_only: true,
        },
      },
      sourceMap: shouldUseSourceMap,
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: cssFilename,
    }),
    // Tailor locales
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(en|zh-cn|zh-tw)$/),
    argv.analyze
    ? new BundleAnalyzerPlugin()
    : null,
  ].filter(Boolean),
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
}

// The notation here is somewhat confusing.
// "postcss" loader applies autoprefixer to our CSS.
// "css" loader resolves paths in CSS and adds assets as dependencies.
// "style" loader normally turns CSS into JS modules injecting <style>,
// but unlike in development configuration, we do something different.
// `ExtractTextPlugin` first applies the "postcss" and "css" loaders
// (second argument), then grabs the result CSS and puts it into a
// separate file in our build process. This way we actually ship
// a single CSS file in production instead of JS code injecting <style>
// tags. If you use code splitting, however, any async bundles will still
// use the "style" loader inside the async code so CSS from them won't be
// in the main CSS file.
function genStyleLoaders (format, isVue) {
  var use = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: shouldUseSourceMap,
        minimize: !argv.devbuild,
      },
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: shouldUseSourceMap },
    },
  ]

  if (format === 'scss') {
    use.push({
      loader: 'sass-loader',
      options: {
        sourceMap: shouldUseSourceMap,
        includePaths: [path.resolve(__dirname, '../node_modules')],
      },
    })
  }

  return ExtractTextPlugin.extract(
    Object.assign(
      {
        fallback: {
          loader: require.resolve(isVue ? 'vue-style-loader' : 'style-loader'),
          options: {
            hmr: false,
          },
        },
        use,
      },
      extractTextPluginOptions
    )
  )
  // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
}

