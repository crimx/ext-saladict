import React, { useState } from 'react'
import i18next from 'i18next'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import {
  withi18nNS,
  withSideEffect,
  withSaladictPanel,
  mockRuntimeMessage
} from '@/_helpers/storybook'
import { SuggestItem } from './Suggest'
import { SearchBox } from './SearchBox'
import { timer } from '@/_helpers/promise-more'

storiesOf('Content Scripts|Menubar', module)
  .addParameters({
    backgrounds: [
      { name: 'Saladict', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(
    withSaladictPanel({
      head: (
        <>
          <style>{require('./Suggest.scss').toString()}</style>
          <style>{require('./SearchBox.scss').toString()}</style>
        </>
      ),
      backgroundColor: 'transparent'
    })
  )
  .addDecorator(withi18nNS('content'))
  .addDecorator(
    withSideEffect(
      mockRuntimeMessage(async message => {
        if (message.type === 'GET_SUGGESTS') {
          await timer(Math.random() * 1500)
          return fakeSuggest(message.payload)
        }
      })
    )
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
