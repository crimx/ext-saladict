import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, text, number } from '@storybook/addon-knobs'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import {
  withSaladictPanel,
  withSideEffect,
  browser
} from '@/_helpers/storybook'
import { Message } from '@/typings/message'
import {
  Speaker,
  StaticSpeakerContainer,
  getStaticSpeakerString,
  getStaticSpeaker
} from './index'

storiesOf('Content Scripts|Components', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(
    withSideEffect(() => {
      browser.runtime.sendMessage.callsFake((message: Message) => {
        if (message.type === 'PLAY_AUDIO') {
          action('Play Audio')(message.payload)
          return new Promise(resolve => {
            setTimeout(() => {
              action('Audio End')(message.payload)
              resolve()
            }, Math.random() * 5000)
          })
        }
        return Promise.resolve()
      })

      return () => {
        browser.runtime.sendMessage.callsFake(() => Promise.resolve())
      }
    })
  )
  .addDecorator(
    withSaladictPanel(<style>{require('./Speaker.scss').toString()}</style>)
  )
  .add('Speaker', () => {
    return (
      <Speaker
        width={number('Icon Width', 20)}
        height={number('Icon Height', 20)}
        src={text('Audio URL', 'https://example.com/a.mp3')}
      ></Speaker>
    )
  })
  .add('StaticSpeakerContainer', () => {
    const textStr = text(
      'Audio URL for getStaticSpeakerString',
      'https://example.com/a.mp3'
    )

    const textNode = text(
      'Audio URL for getStaticSpeaker',
      'https://example.com/b.mp3'
    )

    const node = getStaticSpeaker(textNode)

    return (
      <StaticSpeakerContainer>
        <div
          dangerouslySetInnerHTML={{
            __html: `
          <p>${getStaticSpeakerString(textStr)} ${textStr}</p>
          <p>${node && node.outerHTML} ${textNode}</p>
        `
          }}
        ></div>
      </StaticSpeakerContainer>
    )
  })
