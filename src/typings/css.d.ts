// eslint-disable-next-line
import * as CSS from 'csstype'

declare module 'csstype' {
  interface Properties {
    '--panel-color'?: string
    '--panel-background-color'?: string
    '--panel-width'?: string
    '--panel-max-height'?: string
  }
}
