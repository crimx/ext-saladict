# Saladict 沙拉查词

[![Version](https://img.shields.io/github/release/crimx/ext-saladict.svg?label=version)](https://github.com/crimx/ext-saladict/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/cdonnmffkdaoajfknoeeecmchibpmkmg.svg?label=Chrome%20users)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/cdonnmffkdaoajfknoeeecmchibpmkmg.svg?label=Chrome%20stars)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg)
[![Mozilla Add-on](https://img.shields.io/amo/users/ext-saladict.svg?label=Firefoxe%20users)](https://addons.mozilla.org/firefox/addon/ext-saladict/)
[![Mozilla Add-on](https://img.shields.io/amo/stars/ext-saladict.svg?label=Firefoxe%20stars)](https://addons.mozilla.org/firefox/addon/ext-saladict/)

[![Build Status](https://travis-ci.org/crimx/ext-saladict.svg)](https://travis-ci.org/crimx/ext-saladict)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?maxAge=2592000)](https://standardjs.com/)
[![License](https://img.shields.io/github/license/crimx/ext-saladict.svg?colorB=44cc11?maxAge=2592000)](https://github.com/crimx/ext-saladict/blob/dev/LICENSE)

Chrome/Firefox WebExtension. Feature-rich inline translator with PDF support. Vimium compatible.

[【中文】](https://www.crimx.com/ext-saladict/)Chrome/Firefox 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://github.com/crimx/crx-saladict/releases/" target="_blank"><img src="https://raw.githubusercontent.com/wiki/crimx/ext-saladict/images/notebook.gif" /></a>
</p>

# Downloads

[Chrome Web Store](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg) / [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/ext-saladict/) / [Github Release](https://github.com/crimx/crx-saladict/releases/)

Saladict 6 is a complete rewrite in React Typescript for both Chrome & Firefox. Built for speed, stability and customization.

[CHANGELOG](./CHANGELOG.md)。

# More screenshots:

<p align="center">
  <a href="https://github.com/crimx/crx-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/youdao-page.gif" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/crx-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/screen-notebook.png" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/crx-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/pin.gif" /></a>
</p>

# Development

Clone the repo and run `yarn install`.

## UI Tweaking

`yarn start --main=[entry id]` to view a certain entry with WDS in a fake WebExtension environment.

## Testing

`yarn test` to run Jest.

Toggle:

- `--coverage`: Show coverage instead of watching.

## Building

`yarn devbuild` to start a quick build without compression.

`yarn build` to start a full build.

Toggle:

- `--notypecheck`: Skip TypeScript full check.
- `--analyze`: Show detailed Webpack bundle analyzer.

## Releasing

`yarn release` to bump version and generate [CHANGELOG](./CHANGELOG.md).

## How to add a dictionary

1. Register the dictionary in [app config](./src/app-config/dicts.ts) so that TypeScript generates the correct typings. Dict ID should follow alphabetical order.
1. Create a directory at [`src/components/dictionaries/`](./src/components/dictionaries/), with the name of the dict ID.
  1. Use [Bing](./src/components/dictionaries/bing) as guidance. Copy the files to the new directory.
  1. Replace the favicon with a new 32x32 png.
  1. Update `_locales.json` with the new dictionary name. Add locales for options, if any.
  1. `engine.ts` exports a `search` function which is responsible for fetching, parsing and returning  dictionary results. See the typings for more detail.
     - If the dictionary supports pronunciation:
       1. Register the ID at [`config.autopron`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/app-config/index.ts#L202-L223).
       1. Include an [`audio`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/typings/server.ts#L5-L9) field in the object which search engine returns.
  1. Search result will ultimately be passed to a React PureComponent in `View.tsx`, which renders the result accordingly.
  1. Scope the styles in `_style.scss` following [ECSS](http://ecss.io/chapter5.html#anatomy-of-the-ecss-naming-convention)-ish naming convention.

Add Testing

1. Add response samples at `test/specs/components/dictionaries/[dictID]/response`.
1. Add `engine.spec.ts` to test the engine.

Develop the dictionary UI live

1. Intercept ajax calls in [`config/fake-env/fake-ajax.js`](./config/fake-env/fake-ajax.js). Use the testing response samples.
1. Edit [`src/components/__fake__/index.tsx`](./src/components/__fake__/index.tsx).
1. Run `yarn start --main=components`.
