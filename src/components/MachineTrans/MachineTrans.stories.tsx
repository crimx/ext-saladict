import React from 'react'
import { Subject } from 'rxjs'
import faker from 'faker'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import {
  withSaladictPanel,
  withi18nNS,
  withSideEffect,
  mockRuntimeMessage
} from '@/_helpers/storybook'
import { DictItemHead } from '@/content/components/DictItem/DictItemHead'
import { MachineTrans } from './MachineTrans'
import { machineResult } from './engine'

storiesOf('Content Scripts|Components', module)
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
  .addDecorator(
    withSaladictPanel({
      head: (
        <style>
          {require('./MachineTrans.scss').toString()}
          {require('@/components/Speaker/Speaker.scss').toString()}
          {require('@/content/components/DictItem/DictItemHead.scss').toString()}
        </style>
      )
    })
  )
  .addDecorator(withi18nNS(['content', 'langcode']))
  .add('MachineTrans', () => {
    const rtl = boolean('rtl', true)
    return (
      <MachineTrans
        result={{
          id: 'baidu',
          sl: 'en',
          tl: rtl ? 'ara' : 'zh',
          slInitial: 'collapse',
          searchText: {
            paragraphs: [faker.lorem.paragraph()],
            tts: faker.internet.url()
          },
          trans: {
            paragraphs: [faker.lorem.paragraph()],
            tts: faker.internet.url()
          }
        }}
        searchText={action('Search Text')}
        catalogSelect$={new Subject()}
      />
    )
  })
  .add('MachineTransCatalog', () => {
    const rtl = boolean('rtl', false)
    const noop = () => {}
    const catalogSelect$ = new Subject<{ key: string; value: string }>()
    const mt = machineResult(
      {
        result: {
          id: 'google',
          sl: rtl ? 'ara' : 'en',
          tl: 'zh',
          slInitial: 'hide',
          searchText: {
            paragraphs: [faker.lorem.paragraph()],
            tts: faker.internet.url()
          },
          trans: {
            paragraphs: [faker.lorem.paragraph()],
            tts: faker.internet.url()
          }
        }
      },
      ['zh', 'cht', 'en']
    )
    return (
      <>
        <DictItemHead
          dictID={mt.result.id}
          isSearching={false}
          toggleFold={noop}
          openDictSrcPage={noop}
          onCatalogSelect={v => catalogSelect$.next(v)}
          catalog={mt.catalog}
        />
        <MachineTrans
          result={mt.result}
          searchText={action('Search Text')}
          catalogSelect$={catalogSelect$}
        />
      </>
    )
  })
