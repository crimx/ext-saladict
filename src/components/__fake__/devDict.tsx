/**
 * Env for dev dicts
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { appConfigFactory, DictID } from '@/app-config'

import '@/panel/panel.scss'

window['FAKE_AJAX_DELAY'] = 0

const config = appConfigFactory()

const root = document.getElementById('root') as HTMLDivElement
document.body.style.justifyContent = 'center'
document.body.style.margin = '0 auto'
document.body.style.width = config.panelWidth + 'px'
document.body.style.background = '#ccc'
root.style.background = '#fff'
root.style.overflowY = 'scroll'

interface EnvConfig {
  dict: DictID
  style?: boolean
  text?: string
}

export default function setupEnv ({ dict, style = true, text = 'salad' }: EnvConfig) {
  const search = require('../dictionaries/' + dict + '/engine').default
  const View = require('../dictionaries/' + dict + '/View').default

  if (style) {
    require('../dictionaries/' + dict + '/_style.scss')
  }

  search(text, appConfigFactory())
    .then(result => {
      ReactDOM.render(
        <div className='panel-DictItem'>
          <header className='panel-DictItem_Header'>
            <img className='panel-DictItem_Logo' src={require('@/components/dictionaries/' + dict + '/favicon.png')} alt='dict logo' />
            <h1 className='panel-DictItem_Title'>{dict}</h1>
            <button className='panel-DictItem_FoldArrowBtn'>
              <svg className='panel-DictItem_FoldArrow isActive' width='18' height='18' viewBox='0 0 59.414 59.414' xmlns='http://www.w3.org/2000/svg'>
                <path d='M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58' />
              </svg>
            </button>
          </header>
          <div className='panel-DictItem_Body' style={{ fontSize: config.fontSize }}>
            <article className='panel-DictItem_BodyMesure'>
              <View {...result} />
            </article>
          </div>
        </div>,
        root,
      )
    })
}
