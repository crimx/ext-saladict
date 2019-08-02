import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { action } from '@storybook/addon-actions'
import {
  withKnobs,
  select,
  text,
  number,
  boolean
} from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSaladictPanel
} from '@/_helpers/storybook'
import { newWord } from '@/_helpers/record-manager'
import { MenuBar } from './MenuBar'

storiesOf('Content Scripts|Menubar', module)
  .addDecorator(
    withInfo({
      inline: true,
      header: false
    })
  )
  .addDecorator(withKnobs)
  .addDecorator(
    withSaladictPanel(<style>{require('./MenuBar.scss').toString()}</style>)
  )
  .addDecorator(withi18nNS('content'))
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
