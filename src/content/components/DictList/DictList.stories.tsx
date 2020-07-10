import React from 'react'
import faker from 'faker'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, number, boolean, object } from '@storybook/addon-knobs'
import { withSaladictPanel, withi18nNS } from '@/_helpers/storybook'
import { getAllDicts } from '@/app-config/dicts'
import { getDefaultConfig, DictID } from '@/app-config'
import { HoverBoxContext } from '@/components/HoverBox'
import { DictList } from './DictList'

const defaultLanguage = getDefaultConfig().language

const allDicts = getAllDicts()
const dicts = Object.keys(allDicts).map(id => ({
  dictID: id as DictID,
  preferredHeight: allDicts[id].preferredHeight
}))
const searchStatus = ['IDLE', 'SEARCHING', 'FINISH'] as [
  'IDLE',
  'SEARCHING',
  'FINISH'
]

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
  .addDecorator(story => {
    const rootRef: React.MutableRefObject<HTMLDivElement | null> = {
      current: null
    }
    return (
      <HoverBoxContext.Provider value={rootRef}>
        <div ref={rootRef} style={{ position: 'relative' }}>
          {story()}
        </div>
      </HoverBoxContext.Provider>
    )
  })
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./DictList.scss').toString()}</style>,
      height: 'auto'
    })
  )
  .addDecorator(withi18nNS(['content', 'dicts']))
  .add('DictList', () => (
    <DictList
      touchMode={boolean('Touch Mode', false)}
      language={object('Language', defaultLanguage)}
      doubleClickDelay={number('Double Click Delay', 200)}
      newSelection={action('New Selection')}
      withAnimation={boolean('Enable Animation', true)}
      panelCSS={''}
      dicts={[...Array(faker.random.number({ min: 3, max: 10 }))].map(() => ({
        ...faker.random.arrayElement(dicts),
        searchStatus: faker.random.arrayElement(searchStatus),
        searchResult: {
          paragraphs: faker.lorem.paragraphs(
            faker.random.number({ min: 1, max: 4 })
          )
        },
        TestComp
      }))}
      searchText={action('Search Text')}
      openDictSrcPage={action('Open Dict Source Page')}
      onHeightChanged={action('Height Changed')}
      onUserFold={action('User fold')}
      onSpeakerPlay={async src => action('Speaker Play')(src)}
    />
  ))

function TestComp({ result }: { result: { paragraphs: string } }) {
  return (
    <>
      {result.paragraphs.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </>
  )
}
