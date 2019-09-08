import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, number, boolean } from '@storybook/addon-knobs'
import { withSaladictPanel } from '@/_helpers/storybook'
import faker from 'faker'
import { DictList } from './DictList'
import { getAllDicts } from '@/app-config/dicts'
import { DictID } from '@/app-config'

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
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./DictList.scss').toString()}</style>,
      height: 'auto'
    })
  )
  .add('DictList', () => (
    <DictList
      fontSize={number('Font Size', 13)}
      withAnimation={boolean('Enable Animation', true)}
      dicts={[...Array(faker.random.number({ min: 3, max: 10 }))].map(() => ({
        ...faker.random.arrayElement(dicts),
        searchStatus: faker.random.arrayElement(searchStatus),
        searchResult: {
          paragraphs: faker.lorem.paragraphs(
            faker.random.number({ min: 1, max: 4 })
          )
        },
        dictComp: TestComp
      }))}
      searchText={action('Search Text')}
      openDictSrcPage={action('Open Dict Source Page')}
      onHeightChanged={action('Height Changed')}
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
