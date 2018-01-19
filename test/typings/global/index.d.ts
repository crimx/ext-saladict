/// <reference types="sinon-chrome"/>

import * as SinonChrome from 'sinon-chrome'

declare global {
  interface Window {
    browser: typeof SinonChrome
  }
  var browser: typeof SinonChrome
}
