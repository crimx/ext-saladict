import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, select, number } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSaladictPanel
} from '@/_helpers/storybook'
import { DictItem } from '@/content/components/DictItem/DictItem'
import { getDefaultConfig, DictID } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { SearchFunction, MockRequest } from './helpers'
import { getAllDicts } from '@/app-config/dicts'

const stories = storiesOf('Content Scripts|Dictionaries', module)
  .addParameters({
    backgrounds: [
      { name: 'MenuBar', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(withKnobs)
  .addDecorator(withSaladictPanel)
  .addDecorator(
    withLocalStyle(require('@/content/components/DictItem/DictItem.scss'))
  )
  .addDecorator(withLocalStyle(require('@/_sass_global/_reset.scss')))
  .addDecorator(withi18nNS('content'))

Object.keys(getAllDicts()).forEach(id => {
  stories.add(id, () => <Dict dictID={id as DictID} />)
})

function Dict(props: { dictID: DictID }) {
  const {
    mockSearchTexts,
    mockRequest
  } = require('../../../test/specs/components/dictionaries/' +
    props.dictID +
    '/requests.mock.ts') as {
    mockSearchTexts: string[]
    mockRequest: MockRequest
  }

  const { search } = require('@/components/dictionaries/' +
    props.dictID +
    '/engine.ts') as { search: SearchFunction<any> }

  const searchText = select(
    'Search Text',
    mockSearchTexts.reduce((o, t) => ((o[t] = t), o), {}),
    mockSearchTexts[0]
  )

  const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'FINISH'>('IDLE')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    // mock requests
    const mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
    mock.onAny().reply(config => {
      console.warn(`Unmatch url: ${config.url}`, config)
      return [404, {}]
    })
    return () => mock.restore()
  }, [])

  useEffect(() => {
    setStatus('SEARCHING')
    search(searchText, getDefaultConfig(), getDefaultProfile(), {
      isPDF: false
    }).then(({ result }) => {
      setStatus('FINISH')
      setResult(result)
    })
  }, [searchText])

  return (
    <DictItem
      dictID={props.dictID}
      text={searchText}
      fontSize={number('Font Size', 13)}
      preferredHeight={number('Preferred Height', 256)}
      searchStatus={status}
      searchResult={result}
      searchText={action('Search Text')}
      onHeightChanged={action('Height Changed')}
    />
  )
}
