import React, { useState, useMemo } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, number, boolean, select } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withSideEffect,
  mockRuntimeMessage
} from '@/_helpers/storybook'
import faker from 'faker'
import { DictPanel, DictPanelProps } from './DictPanel'
import { DictPanelPortal } from './DictPanel.portal'
import { newWord } from '@/_helpers/record-manager'
import { getAllDicts } from '@/app-config/dicts'
import { DictID } from '@/app-config'
import { MenuBar } from '../MenuBar/MenuBar'
import { MtaBox } from '../MtaBox/MtaBox'
import { DictList } from '../DictList/DictList'
import { WaveformBox } from '../WaveformBox/WaveformBox'
import { timer } from '@/_helpers/promise-more'
import { SuggestItem } from '../MenuBar/Suggest'

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
    withSideEffect(
      mockRuntimeMessage(async message => {
        if (message.type === 'GET_SUGGESTS') {
          await timer(Math.random() * 1500)
          return fakeSuggest(message.payload)
        }
        console.log(message.type)
      })
    )
  )
  .addDecorator(withLocalStyle(require('./DictPanel.shadow.scss').toString()))
  // @ts-ignore
  .addDecorator(Story => <Story />)
  .add('DictPanel', () => <DictPanel {...useDictPanelProps()} />)
  .add('DictPanelPortal', () => (
    <DictPanelPortal show={boolean('Show', true)} {...useDictPanelProps()} />
  ))

function useDictPanelProps(): DictPanelProps {
  const [text, setText] = useState('saladict')
  const [expandMta, setExpandMta] = useState(false)
  const [expandWavform, setExpandWavform] = useState(false)
  const withAnimation = boolean('Enable Animation', true)
  const [dragStartCoord, setDragStartCoord] = useState<null | {
    x: number
    y: number
  }>(null)

  const dictsNum = number(
    'Dict Item Count',
    faker.random.number({ min: 3, max: 10 })
  )

  const randomDicts = useMemo(() => {
    const shuffledDicts = faker.helpers.shuffle(
      dicts.map(config => ({
        ...config,
        searchStatus: faker.random.arrayElement(searchStatus),
        searchResult: {
          paragraphs: faker.lorem.paragraphs(
            faker.random.number({ min: 1, max: 4 })
          )
        },
        dictComp: TestComp
      }))
    )
    return shuffledDicts.slice(
      0,
      faker.random.number({ max: shuffledDicts.length })
    )
  }, [dictsNum])

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

  const darkMode = boolean('Dark Mode', false)
  const colors = darkMode
    ? {
        brand: '#218c74',
        background: '#222',
        backgroundRGB: '34, 34, 34',
        font: '#ddd',
        divider: '#4d4748'
      }
    : {
        brand: '#5caf9e',
        background: '#fff',
        backgroundRGB: '255, 255, 255',
        font: '#333',
        divider: '#ddd'
      }

  return {
    coord: {
      x: number('x', (window.innerWidth - 450) / 2),
      y: number('y', 10)
    },
    takeCoordSnapshot: boolean('Take Coord Snapshot', false),
    width: number('Width', 450),
    height: number('Height', window.innerHeight - 20),
    maxHeight: number('Max Height', window.innerHeight - 40),
    withAnimation: withAnimation,
    darkMode,
    colors,
    menuBar: (
      <MenuBar
        text={text}
        updateText={text => {
          action('Update Text')(text)
          setText(text)
        }}
        searchText={action('Search Text')}
        isInNotebook={boolean('Is In Notebook', false)}
        addToNoteBook={action('Add to Notebook')}
        shouldFocus={!expandMta}
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
        onHeightChanged={newHeight => {
          action('MenuBar Height Changed')(newHeight)
        }}
        onDragAreaMouseDown={e =>
          setDragStartCoord({ x: e.clientX, y: e.clientY })
        }
        onDragAreaTouchStart={e =>
          setDragStartCoord({
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
          })
        }
      />
    ),
    mtaBox: (
      <MtaBox
        text={text}
        expand={expandMta}
        maxHeight={number('Mta Max Height', 100)}
        searchText={action('Search Text')}
        onInput={text => {
          action('Input')(text)
          setText(text)
        }}
        onDrawerToggle={() => {
          action('Drawer Toggle')()
          setExpandMta(!expandMta)
        }}
        onHeightChanged={action('Dict Mta Box Height Changed')}
      />
    ),
    dictList: (
      <DictList
        fontSize={number('Font Size', 13)}
        withAnimation={withAnimation}
        dicts={randomDicts}
        searchText={action('Search Text')}
        openDictSrcPage={action('Open Source Page')}
        onSpeakerPlay={async src => action('Open Source Page')(src)}
        onHeightChanged={action('Dict List Height Changed')}
      />
    ),
    waveformBox: (
      <WaveformBox
        isExpand={expandWavform}
        toggleExpand={() => setExpandWavform(flag => !flag)}
        onHeightChanged={action('Dict Waveform Box Height Changed')}
      />
    ),
    dragStartCoord,
    onDragEnd: () => setDragStartCoord(null)
  }
}

function TestComp({ result }: { result: { paragraphs: string } }) {
  return (
    <>
      {result.paragraphs.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </>
  )
}

function fakeSuggest(text: string): SuggestItem[] {
  return Array.from(Array(10)).map((v, i) => ({
    explain: `单词 ${text} 的各种相近的建议#${i}`,
    entry: `Word ${text}#${i}`
  }))
}
