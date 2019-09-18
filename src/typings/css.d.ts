// eslint-disable-next-line
import * as CSS from 'csstype'

declare module 'csstype' {
  interface Properties {
    '--panel-width'?: string
    '--panel-max-height'?: string
    '--color-brand'?: string
    '--color-font'?: string
    '--color-background'?: string
    '--color-rgb-background'?: string
    '--color-divider'?: string
  }
}
