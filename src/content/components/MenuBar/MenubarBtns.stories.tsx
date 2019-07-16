import React from 'react'
import i18next from 'i18next'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import {
  withLocalStyle,
  withi18nNS,
  withSaladictPanel
} from '@/_helpers/storybook'
import {
  HistoryBackBtn,
  HistoryNextBtn,
  SearchBtn,
  OptionsBtn,
  FavBtn,
  HistoryBtn,
  PinBtn,
  CloseBtn
} from './MenubarBtns'

storiesOf('Content Scripts|Menubar', module)
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
  .addDecorator(withSaladictPanel)
  .addDecorator(withLocalStyle(require('./MenubarBtns.scss')))
  .addDecorator(withLocalStyle(require('@/_sass_global/_reset.scss')))
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
  .add('SearchBtn', () => {
    return (
      <SearchBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
  .add('OptionsBtn', () => {
    return (
      <OptionsBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
        onKeyDown={action('onKeyDown')}
        onMouseOver={action('onMouseOver')}
        onMouseOut={action('onMouseOut')}
      />
    )
  })
  .add('FavBtn', () => {
    return (
      <FavBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        isFav={boolean('Is in Notebook', true)}
        onClick={action('onClick')}
        onMouseDown={action('onMouseDown')}
      />
    )
  })
  .add('HistoryBtn', () => {
    return (
      <HistoryBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
  .add('PinBtn', () => {
    return (
      <PinBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        isPinned={boolean('Is pinned', false)}
        onClick={action('onClick')}
      />
    )
  })
  .add('CloseBtn', () => {
    return (
      <CloseBtn
        t={i18next.getFixedT(i18next.language, 'content')}
        disabled={boolean('Disabled', false)}
        onClick={action('onClick')}
      />
    )
  })
