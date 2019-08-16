import React from 'react'
import { storiesOf } from '@storybook/react'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { action } from '@storybook/addon-actions'
import { withKnobs, select, text, number, array } from '@storybook/addon-knobs'
import { withi18nNS, withSaladictPanel } from '@/_helpers/storybook'
import { DictItem } from './DictItem'

storiesOf('Content Scripts|Dict Panel', module)
  .addParameters({
    backgrounds: [
      { name: 'Saladict', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(withi18nNS('content'))
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./DictItem.scss').toString()}</style>,
      height: 'auto'
    })
  )
  // @ts-ignore: wrong storybook typing
  .add('DictItem', ({ fontSize, withAnimation }) => {
    return (
      <DictItem
        dictID="baidu"
        text={text('Search Text', 'test')}
        fontSize={fontSize}
        withAnimation={withAnimation}
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
