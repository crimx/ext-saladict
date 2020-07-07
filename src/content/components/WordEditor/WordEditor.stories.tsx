import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { WordEditor } from './WordEditor'
import {
  withLocalStyle,
  withSideEffect,
  mockRuntimeMessage,
  withi18nNS
} from '@/_helpers/storybook'
import faker from 'faker'
import { newWord } from '@/_helpers/record-manager'
import getDefaultConfig from '@/app-config'
import WordEditorPortal from './WordEditor.portal'

storiesOf('Content Scripts|WordEditor', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(
    withSideEffect(
      mockRuntimeMessage(async message => {
        action(message.type)(message['payload'])
        switch (message.type) {
          case 'GET_WORDS_BY_TEXT':
            return faker.random.boolean()
              ? [
                  newWord({
                    date: faker.date.past().valueOf(),
                    text: message.payload.text,
                    context: faker.lorem.sentence(),
                    title: faker.random.word(),
                    url: faker.internet.url(),
                    favicon: faker.image.imageUrl(),
                    trans: faker.lorem.sentence(),
                    note: faker.lorem.sentences()
                  })
                ]
              : []
        }
      })
    )
  )
  .addDecorator(withi18nNS(['common', 'content']))
  .add(
    'WordEditor',
    () => {
      const config = getDefaultConfig()
      const darkMode = boolean('Dark Mode', false)

      return (
        <WordEditor
          containerWidth={number('Panel X', 450 + 100)}
          darkMode={darkMode}
          wordEditor={{
            word: newWord({
              date: faker.date.past().valueOf(),
              text: faker.random.word(),
              context: faker.lorem.sentence(),
              title: faker.random.word(),
              url: faker.internet.url(),
              favicon: faker.image.imageUrl(),
              trans: faker.lorem.sentence(),
              note: faker.lorem.sentences()
            }),
            translateCtx: false
          }}
          ctxTrans={config.ctxTrans}
          onClose={action('Close')}
        />
      )
    },
    {
      decorators: [withLocalStyle(require('./WordEditor.scss'))],
      jsx: { skip: 1 }
    }
  )
  .add('WordEditorPortal', () => {
    const config = getDefaultConfig()
    const darkMode = boolean('Dark Mode', false)

    return (
      <WordEditorPortal
        show={boolean('Show', true)}
        darkMode={darkMode}
        withAnimation={boolean('With Animation', true)}
        containerWidth={number('Panel X', 450 + 100)}
        wordEditor={{
          word: newWord({
            date: faker.date.past().valueOf(),
            text: faker.random.word(),
            context: faker.lorem.sentence(),
            title: faker.random.word(),
            url: faker.internet.url(),
            favicon: faker.image.imageUrl(),
            trans: faker.lorem.sentence(),
            note: faker.lorem.sentences()
          }),
          translateCtx: false
        }}
        ctxTrans={config.ctxTrans}
        onClose={action('Close')}
      />
    )
  })
