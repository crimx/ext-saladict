import React from 'react'
import faker from 'faker'
import { storiesOf } from '@storybook/react'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { action } from '@storybook/addon-actions'
import { withKnobs, select, number } from '@storybook/addon-knobs'
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
  .add('DictItem', ({ withAnimation }) => {
    return (
      <DictItem
        dictID="baidu"
        withAnimation={withAnimation}
        panelCSS={''}
        preferredHeight={number('Preferred Height', 256)}
        searchStatus={select(
          'Search Status',
          { IDLE: 'IDLE', SEARCHING: 'SEARCHING', FINISH: 'FINISH' },
          'FINISH'
        )}
        searchResult={{
          count: number('Paragraphs', 5)
        }}
        TestComp={({ result }: { result: { count: number } }) => (
          <>
            {[...Array(result.count)].map((line, i) => (
              <p key={i}>{faker.lorem.paragraph()}</p>
            ))}
          </>
        )}
        searchText={action('Search Text')}
        openDictSrcPage={action('Open Dict Source Page')}
        onHeightChanged={action('Height Changed')}
        onUserFold={action('User fold')}
        onInPanelSelect={action('In-panel Selection')}
        onSpeakerPlay={async src => action('Speaker Play')(src)}
      />
    )
  })
