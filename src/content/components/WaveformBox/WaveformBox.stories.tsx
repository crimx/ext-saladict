import React from 'react'
import { storiesOf } from '@storybook/react'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { withSaladictPanel } from '@/_helpers/storybook'
import { WaveformBox } from './WaveformBox'
import { action } from '@storybook/addon-actions'

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
  .addDecorator(story => (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      {story()}
    </div>
  ))
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./WaveformBox.scss').toString()}</style>
    })
  )
  .add('WaveformBox', () => (
    <WaveformBox
      darkMode={boolean('Dark Mode', false)}
      isExpand={boolean('Expand', true)}
      toggleExpand={action('Toggle Expand')}
      onHeightChanged={action('Height Changed')}
    />
  ))
