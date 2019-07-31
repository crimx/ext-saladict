import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { action } from '@storybook/addon-actions'
import { withKnobs, select, text, number, array } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSaladictPanel
} from '@/_helpers/storybook'
import { DictItem } from './DictItem'

storiesOf('Content Scripts|DictItem', module)
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
  .addDecorator(withLocalStyle(require('./DictItem.scss')))
  .addDecorator(withLocalStyle(require('@/_sass_global/_reset.scss')))
  .addDecorator(withi18nNS('content'))
  .add('DictItem', () => {
    return (
      <DictItem
        dictID="baidu"
        text={text('Search Text', 'test')}
        fontSize={number('Font Size', 13)}
        preferredHeight={number('Preferred Height', 256)}
        searchStatus={select(
          'Search Status',
          { IDLE: 'IDLE', SEARCHING: 'SEARCHING', FINISH: 'FINISH' },
          'FINISH'
        )}
        searchResult={array(
          'Search Result',
          Array(5).fill(
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt eum ratione assumenda accusantium vel numquam voluptate nam ab laborum ut aliquam illum alias nemo perspiciatis rem distinctio illo, expedita nihil sint! Non distinctio, cum quam esse quod, possimus itaque velit reiciendis dolor, et aut minima? Quas quae laudantium doloremque unde.'
          )
        )}
        dictComp={({ result }: { result: string[] }) => (
          <>
            {result.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </>
        )}
        searchText={action('Search Text')}
      />
    )
  })
