# Contributing to Saladict

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

## How to Contribute

- Read [How to get started](#how-to-get-started).
- Follow [code style](#code-style) and [commit style](#commit-style).
- Before submit, run [test](#testing) and [build](#building) locally. Or leave it to CI.

## How to get started

Clone the repo and run `yarn install`.

## UI Tweaking

`yarn start --main=[entry id]` to view a certain entry with WDS in a fake WebExtension environment.

Entry ids are generally directory names in `src`.

`index.[html/js(x)/ts[x]]` in `[entry id]/__fake__` has higher priority.

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

## Zipball

`yarn zip` to pack zibballs to `./dist/`.

## How to add a dictionary

1. Register the dictionary in [app config](./src/app-config/dicts.ts) so that TypeScript generates the correct typings. Dict ID **MUST** follow alphabetical order.
1. Create a directory at [`src/components/dictionaries/`](./src/components/dictionaries/), with the name of the dict ID.
  1. Use any existing dictionary as guidance, e.g. [Bing](./src/components/dictionaries/bing). Copy files to the new directory.
  1. Replace the favicon with a new LOGO.
  1. Update `_locales.json` with the new dictionary name. Add locales for options, if any.
  1. `engine.ts` **MUST** export at least two functions:
     1. `getSrcPage` function which is responsible for generating source page url base on search text and app config. Source page url is opened when user clicks the dictionary title.
     1. `search` function which is responsible for fetching, parsing and returning dictionary results. See the typings for more detail.
        - Extracting information from a webpage **MUST** use helper functions in [../helpers.ts](./components/dictionaries/helpers.ts) for data cleansing.
        - If the dictionary supports pronunciation:
          1. Register the ID at [`config.autopron`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/app-config/index.ts#L202-L223).
          1. Include an [`audio`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/typings/server.ts#L5-L9) field in the object which search engine returns.
      1. Other exported functions can be called from `View.tsx` via `DictEngineMethod` message channel, see `src/typings/message` for typing details (also don't use the native `sendMessage` function, import `{ message }` from `'@/_helpers/browser-api'`).
  1. Search result will ultimately be passed to a React PureComponent in `View.tsx`, which **SHOULD** be a dumb component that renders the result accordingly.
  1. Scope the styles in `_style.scss` following [ECSS](http://ecss.io/chapter5.html#anatomy-of-the-ecss-naming-convention)-ish naming convention.

Add Testing

1. Add response samples at `test/specs/components/dictionaries/[dictID]/response`.
1. Add `engine.spec.ts` to test the engine.

Develop the dictionary UI live

1. Intercept ajax calls in [`config/fake-env/fake-ajax.js`](./config/fake-env/fake-ajax.js). Use the testing response samples.
1. Edit [`src/components/__fake__/index.tsx`](./src/components/__fake__/index.tsx).
1. Run `yarn start --main=components`.

## Code Style

This project follows the TypeScript variation of [Standard](https://standardjs.com) JavaScript code style.

If you are using IDEs like VSCode, make sure TSLint related plugins are installed. Or you can just run [building command](#building) to perform a TypeScript full check.

## Commit Style

This project follows [conventional](https://conventionalcommits.org/) commit style.

You can run `yarn commit` and follow the instructions, or use [vscode-commitizen](https://github.com/KnisterPeter/vscode-commitizen) extension in VSCode.
