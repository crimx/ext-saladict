import React, { useState } from 'react'
import i18next from 'i18next'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSideEffect,
  withSaladictPanel
} from '@/_helpers/storybook'
import { SuggestItem } from './Suggest'
import { SearchBox } from './SearchBox'
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
  .addDecorator(withLocalStyle(require('./SearchBox.scss')))
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

      return () =>
        // @ts-ignore
        browser.runtime.sendMessage.callsFake(() => Promise.resolve())
    })
  )
  // @ts-ignore
  .addDecorator(Story => <Story />)
  .add('SearchBox', () => {
    const [text, setText] = useState('text')
    return (
      <SearchBox
        t={i18next.getFixedT(i18next.language, 'content')}
        text={text}
        isFocusOnMount={boolean('Focus On Mount', true)}
        enableSuggest={boolean('Enable Suggest', true)}
        onInput={text => {
          setText(text)
          action('Input')(text)
        }}
        onSearch={text => {
          setText(text)
          action('Search')(text)
        }}
      />
    )
  })

function fakeSuggest(text: string): SuggestItem[] {
  return Array.from(Array(10)).map((v, i) => ({
    explain: `单词 ${text} 的各种相近的建议#${i}`,
    entry: `Word ${text}#${i}`
  }))
}
