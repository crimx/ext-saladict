import * as SinonChrome from 'sinon-chrome'

export const browser = (window.browser as unknown) as typeof SinonChrome
