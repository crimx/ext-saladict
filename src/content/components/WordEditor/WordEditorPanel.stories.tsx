import React from 'react'
import classNames from 'classnames'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean, number, text } from '@storybook/addon-knobs'
import { WordEditorPanel } from './WordEditorPanel'
import {
  withLocalStyle,
  withSideEffect,
  mockRuntimeMessage,
  withi18nNS
} from '@/_helpers/storybook'
import faker from 'faker'

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
  .addDecorator(withi18nNS(['common', 'content']))
  .add(
    'WordEditorPanel',
    () => {
      const darkMode = boolean('Dark Mode', false)

      return (
        <div className={classNames({ darkMode })}>
          <div
            className="saladict-theme"
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px 0'
            }}
          >
            <WordEditorPanel
              containerWidth={number('Panel X', 450 + 100)}
              btns={
                boolean('With Buttons', true)
                  ? [
                      {
                        type: 'normal',
                        title: 'Normal Button',
                        onClick: action('Normal button clicked')
                      },
                      {
                        type: 'primary',
                        title: 'Primary Button',
                        onClick: action('Primary button clicked')
                      }
                    ]
                  : undefined
              }
              title={text('Title', faker.random.word())}
              onClose={action('Close')}
            >
              <div style={{ padding: 10 }}>
                {text('Content', faker.lorem.paragraphs())
                  .split('\n')
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </WordEditorPanel>
          </div>
        </div>
      )
    },
    {
      decorators: [
        withLocalStyle(require('./WordEditorPanel.scss')),
        withLocalStyle(require('@/_sass_shared/_theme.scss'))
      ],
      jsx: { skip: 1 }
    }
  )
