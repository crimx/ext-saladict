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
  mockRuntimeMessage
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
      })
    )
  )
  .add(
    'WordEditor',
    () => {
      const config = getDefaultConfig()
      const darkMode = boolean('Dark Mode', false)
      const colors = darkMode
        ? {
            backgroundColor: '#222',
            color: '#ddd',
            '--color-brand': '#218c74',
            '--color-background': '#222',
            '--color-rgb-background': '34, 34, 34',
            '--color-font': '#ddd',
            '--color-divider': '#4d4748'
          }
        : {
            backgroundColor: '#fff',
            color: '#333',
            '--color-brand': '#5caf9e',
            '--color-background': '#fff',
            '--color-rgb-background': '255, 255, 255',
            '--color-font': '#333',
            '--color-divider': '#ddd'
          }

      return (
        <WordEditor
          width={number('Dict Panel Width', 450)}
          darkMode={darkMode}
          colors={colors}
          word={newWord({
            date: faker.date.past().valueOf(),
            text: faker.random.word(),
            context: faker.lorem.sentence(),
            title: faker.random.word(),
            url: faker.internet.url(),
            favicon: faker.image.imageUrl(),
            trans: faker.lorem.sentence(),
            note: faker.lorem.sentences()
          })}
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
    const colors = darkMode
      ? {
          backgroundColor: '#222',
          color: '#ddd',
          '--color-brand': '#218c74',
          '--color-background': '#222',
          '--color-rgb-background': '34, 34, 34',
          '--color-font': '#ddd',
          '--color-divider': '#4d4748'
        }
      : {
          backgroundColor: '#fff',
          color: '#333',
          '--color-brand': '#5caf9e',
          '--color-background': '#fff',
          '--color-rgb-background': '255, 255, 255',
          '--color-font': '#333',
          '--color-divider': '#ddd'
        }
    return (
      <WordEditorPortal
        show={boolean('Show', true)}
        darkMode={darkMode}
        withAnimation={boolean('With Animation', true)}
        colors={colors}
        width={number('Dict Panel Width', 450)}
        word={newWord({
          date: faker.date.past().valueOf(),
          text: faker.random.word(),
          context: faker.lorem.sentence(),
          title: faker.random.word(),
          url: faker.internet.url(),
          favicon: faker.image.imageUrl(),
          trans: faker.lorem.sentence(),
          note: faker.lorem.sentences()
        })}
        ctxTrans={config.ctxTrans}
        onClose={action('Close')}
      />
    )
  })
