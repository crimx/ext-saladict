import { Init } from '../utils/types'
import { addConfigListener } from '@/_helpers/config-manager'
import {
  addActiveProfileListener,
  createProfileIDListStream
} from '@/_helpers/profile-manager'
import {
  isPopupPage,
  isQuickSearchPage,
  isOptionsPage
} from '@/_helpers/saladict'
import { StoreActionCatalog, StoreAction, StoreState } from '.'
import { message } from '@/_helpers/browser-api'
import { PreloadSource } from '@/app-config'
import { Dispatch } from 'redux'
import { Word, newWord } from '@/_helpers/record-manager'

export const init: Init<StoreActionCatalog, StoreState> = (
  dispatch,
  getState
) => {
  addConfigListener(({ newConfig }) => {
    dispatch({ type: 'NEW_CONFIG', payload: newConfig })
  })

  addActiveProfileListener(({ newProfile }) => {
    dispatch({ type: 'NEW_ACTIVE_PROFILE', payload: newProfile })
  })

  createProfileIDListStream().subscribe(idlist => {
    dispatch({ type: 'NEW_PROFILES', payload: idlist })
  })

  message.addListener(msg => {
    switch (msg.type) {
      case 'TEMP_DISABLED_STATE':
        if (msg.payload.op === 'set') {
          dispatch({ type: 'TEMP_DISABLED_STATE', payload: msg.payload.value })
          return Promise.resolve(true)
        } else {
          return Promise.resolve(getState().isTempDisabled)
        }

      case 'QS_PANEL_SEARCH_TEXT':
        if (isQuickSearchPage()) {
          // request searching text, from other tabs
          dispatch({ type: 'SEARCH_START', payload: { word: msg.payload } })
          // focus standalone panel
          message.send({ type: 'OPEN_QS_PANEL' })
        }
        return Promise.resolve()

      case 'QS_PANEL_CHANGED':
        if (!isQuickSearchPage()) {
          dispatch({ type: 'QS_PANEL_CHANGED', payload: msg.payload })
        }
        return Promise.resolve()
    }
  })

  message.self.addListener(msg => {
    switch (msg.type) {
      case 'ESCAPE_KEY':
        dispatch({ type: 'CLOSE_PANEL' })
        return Promise.resolve()

      case 'SEARCH_TEXT':
        dispatch({ type: 'SEARCH_START', payload: { word: msg.payload } })
        return Promise.resolve()

      case 'TRIPLE_CTRL':
        if (!isPopupPage() && !isOptionsPage()) {
          const { isShowDictPanel, config, selection } = getState()
          if (config.tripleCtrl) {
            if (config.tripleCtrlStandalone) {
              // focus if the standalone panel is already opened
              message.send({ type: 'OPEN_QS_PANEL' })
            } else if (!isShowDictPanel) {
              dispatch({ type: 'OPEN_QS_PANEL' })
              summonedPanelInit(
                dispatch,
                selection.word,
                config.tripleCtrlPreload,
                config.tripleCtrlAuto,
                ''
              )
            }
          }
        }
        return Promise.resolve()
    }
  })

  if (isPopupPage()) {
    const { config, selection } = getState()
    summonedPanelInit(
      dispatch,
      selection.word,
      config.baPreload,
      config.baAuto,
      'popup'
    )
  }

  if (isQuickSearchPage()) {
    const { config, selection } = getState()
    summonedPanelInit(
      dispatch,
      selection.word,
      config.tripleCtrlPreload,
      config.tripleCtrlAuto,
      'quick-search'
    )
  } else {
    message
      .send<'QUERY_QS_PANEL'>({ type: 'QUERY_QS_PANEL' })
      .then(response =>
        dispatch({ type: 'QS_PANEL_CHANGED', payload: response })
      )
  }
}

/**
 * Summoned panel could be the dict panel
 * 1. in Standalone Quick Search page.
 * 2. in Popup page (Browser Action).
 * 3. triggered by triple ctrl shortcut.
 */
async function summonedPanelInit(
  dispatch: Dispatch<StoreAction>,
  word: Word | null,
  preload: PreloadSource,
  autoSearch: boolean,
  // quick-search could be turned off so this argument is needed
  standalone: '' | 'popup' | 'quick-search'
) {
  if (!preload) {
    return
  }

  try {
    if (preload === 'selection') {
      if (standalone === 'popup') {
        const tab = (await browser.tabs.query({
          active: true,
          currentWindow: true
        }))[0]
        if (tab && tab.id != null) {
          word = await message.send<'PRELOAD_SELECTION'>(tab.id, {
            type: 'PRELOAD_SELECTION'
          })
        }
      } else if (standalone === 'quick-search') {
        const infoText = new URL(document.URL).searchParams.get('info')
        if (infoText) {
          try {
            word = JSON.parse(decodeURIComponent(infoText))
          } catch (err) {
            word = null
          }
        }
      }
    } /* preload === clipboard */ else {
      const text = await message.send<'GET_CLIPBOARD'>({
        type: 'GET_CLIPBOARD'
      })
      word = newWord({ text, title: 'From Clipboard' })
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(e)
    }
  }

  if (word) {
    if (autoSearch && word.text) {
      dispatch({ type: 'SEARCH_START', payload: { word } })
    } else {
      dispatch({ type: 'SUMMONED_PANEL_INIT', payload: word.text })
    }
  }
}
