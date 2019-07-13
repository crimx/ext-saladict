import React from 'react'
import i18next from 'i18next'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { withLocalStyle, withi18nNS } from '@/_helpers/storybook'
import { HistoryBackBtn, HistoryNextBtn } from './MenubarBtns'

storiesOf('Content Scripts|MenubarBtns', module)
  .addParameters({
    backgrounds: [
      { name: 'MenuBar', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' }
    ]
  })
  .addDecorator(
    withInfo({
      inline: true,
      header: false
    })
  )
  .addDecorator(withKnobs)
  .addDecorator(withLocalStyle(require('./_style.scss')))
  .addDecorator(withi18nNS('content'))
  .add('HistoryBackBtn', () => {
    return (
      <HistoryBackBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
  .add('HistoryNextBtn', () => {
    return (
      <HistoryNextBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
