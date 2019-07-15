import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs, text } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSideEffect,
  withSaladictPanel
} from '@/_helpers/storybook'
import { Suggest, SuggestItem } from './Suggest'
import { Message } from '@/typings/message'

storiesOf('Content Scripts|Menubar', module)
  .addParameters({
    backgrounds: [
      { name: 'MenuBar', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(
    withInfo({
      inline: true,
      header: false
    })
  )
  .addDecorator(withKnobs)
  .addDecorator(withSaladictPanel)
  .addDecorator(withLocalStyle(require('./Suggest.scss')))
  .addDecorator(withLocalStyle(require('@/_sass_global/_reset.scss')))
  .addDecorator(withi18nNS('content'))
  .addDecorator(
    withSideEffect(() => {
      // @ts-ignore
      browser.runtime.sendMessage.callsFake((message: Message) => {
        if (message.type === 'GET_SUGGESTS') {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(fakeSuggest(message.payload))
            }, Math.random() * 1500)
          })
        }
        return Promise.resolve()
      })
    })
  )
  .add('Suggest', () => {
    return (
      <Suggest
        text={text('Search text', 'text')}
        onSelect={action('Select')}
        onFocus={action('Focus')}
        onBlur={action('Blur')}
      />
    )
  })

function fakeSuggest(text: string): SuggestItem[] {
  return Array.from(Array(10)).map((v, i) => ({
    explain: `单词 ${text} 的各种相近的建议#${i}`,
    entry: `Word ${text}#${i}`
  }))
}
