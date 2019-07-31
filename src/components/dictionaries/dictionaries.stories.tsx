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
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { SearchFunction, MockRequest } from './helpers'

storiesOf('Content Scripts|Dictionaries', module)
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
  .add('baidu', () => <Dict />)

function Dict() {
  const {
    mockSearchTexts,
    mockRequest
  } = require('../../../test/specs/components/dictionaries/' +
    // props.dictID +
    'baidu' +
    '/requests.mock.ts') as {
    mockSearchTexts: string[]
    mockRequest: MockRequest
  }

  const { search } = require('@/components/dictionaries/' +
    // props.dictID +
    'baidu' +
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
      dictID="baidu"
      text={searchText}
      fontSize={number('Font Size', 13)}
      preferredHeight={number('Preferred Height', 256)}
      searchStatus={status}
      searchResult={result}
      searchText={action('Search Text')}
    />
  )
}
