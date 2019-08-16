import React from 'react'
import { storiesOf } from '@storybook/react'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { action } from '@storybook/addon-actions'
import {
  withKnobs,
  select,
  text,
  number,
  boolean
} from '@storybook/addon-knobs'
import {
  withSaladictPanel,
  withSideEffect,
  mockRuntimeMessage
} from '@/_helpers/storybook'
import { newWord } from '@/_helpers/record-manager'
import { MenuBar } from './MenuBar'
import { timer } from '@/_helpers/promise-more'
import { SuggestItem } from './Suggest'

storiesOf('Content Scripts|Dict Panel/Menubar', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./MenuBar.scss').toString()}</style>,
      backgroundColor: 'transparent'
    })
  )
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
  .add('MenuBar', () => {
    const histories = Array.from(Array(5)).map((_, i) =>
      newWord({
        date: Date.now(),
        text: 'text' + (i + 1)
      })
    )

    const profiles = Array.from(Array(5)).map((_, i) => ({
      id: `profile${i + 1}`,
      name: `Profile${i + 1}`
    }))

    const profilesOption = profiles.reduce((o, p) => {
      o[p.name] = p.id
      return o
    }, {})

    return (
      <MenuBar
        text={text('Search Text', 'text')}
        updateText={action('Update Text')}
        searchText={action('Search Text')}
        isInNotebook={boolean('Is In Notebook', false)}
        addToNoteBook={action('Add to Notebook')}
        isFocusInputOnMount={true}
        enableSuggest={boolean('Enable Suggest', true)}
        histories={histories}
        historyIndex={number('History Index', 0)}
        updateHistoryIndex={action('Update History Index')}
        isPinned={boolean('Is Pinned', false)}
        togglePin={action('Toggle Pin')}
        onClose={action('Close Panel')}
        profiles={profiles}
        activeProfileId={select(
          'Active Profile',
          profilesOption,
          profiles[0].id
        )}
        onDragAreaMouseDown={action('Darg Area Mousedown')}
        onDragAreaTouchStart={action('Darg Area Touchstart')}
      />
    )
  })

function fakeSuggest(text: string): SuggestItem[] {
  return Array.from(Array(10)).map((v, i) => ({
    explain: `单词 ${text} 的各种相近的建议#${i}`,
    entry: `Word ${text}#${i}`
  }))
}
