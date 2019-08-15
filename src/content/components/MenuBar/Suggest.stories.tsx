import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, text } from '@storybook/addon-knobs'
import {
  withi18nNS,
  withSideEffect,
  withSaladictPanel,
  mockRuntimeMessage
} from '@/_helpers/storybook'
import { Suggest, SuggestItem } from './Suggest'
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
      head: <style>{require('./Suggest.scss').toString()}</style>,
      height: 'auto',
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
