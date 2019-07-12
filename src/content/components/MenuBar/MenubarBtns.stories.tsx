import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { useTranslate } from '@/_helpers/i18n'
import { withLocalStyle } from '@/_helpers/storybook'
import { HistoryBackBtn, HistoryNextBtn } from './MenubarBtns'

storiesOf('Content Scripts|MenubarBtns', module)
  .addParameters({
    backgrounds: [
      { name: 'MenuBar', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(withKnobs)
  .addDecorator(withLocalStyle(require('./_style.scss')))
  .add('HistoryBackBtn', () => {
    return (
      <HistoryBackBtn
        t={useTranslate('content').t}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
  .add('HistoryNextBtn', () => {
    return (
      <HistoryNextBtn
        t={useTranslate('content').t}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
