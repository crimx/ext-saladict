import { addConfigListener } from '@/_helpers/config-manager'
import {
  addActiveProfileListener,
  createProfileIDListStream
} from '@/_helpers/profile-manager'
import {
  isPopupPage,
  isQuickSearchPage,
  isOptionsPage,
  isStandalonePage
} from '@/_helpers/saladict'
import { message } from '@/_helpers/browser-api'
import { Word, newWord } from '@/_helpers/record-manager'
import { timer } from '@/_helpers/promise-more'
import { MessageResponse } from '@/typings/message'
import { StoreDispatch, StoreState } from './modules'

export const init = (dispatch: StoreDispatch, getState: () => StoreState) => {
  window.addEventListener('resize', () => {
    dispatch({ type: 'WINDOW_RESIZE' })
  })

  addConfigListener(({ newConfig }) => {
    if (newConfig.active !== getState().config.active) {
      message.send({
        type: 'SEND_TAB_BADGE_INFO',
        payload: {
          active: newConfig.active,
          tempDisable: getState().isTempDisabled,
          unsupported: isStandalonePage()
            ? false
            : document.body.tagName !== 'BODY'
        }
      })
    }

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
          setTimeout(() => {
            const state = getState()
            message.send({
              type: 'SEND_TAB_BADGE_INFO',
              payload: {
                active: state.config.active,
                tempDisable: state.isTempDisabled,
                unsupported: isStandalonePage()
                  ? false
                  : document.body.tagName !== 'BODY'
              }
            })
          }, 0)
          return Promise.resolve(true)
        } else {
          return Promise.resolve(getState().isTempDisabled)
        }

      case 'SEARCH_TEXT_BOX': {
        const { searchHistory, historyIndex, text } = getState()
        dispatch({
          type: 'SEARCH_START',
          payload: {
            word:
              searchHistory[historyIndex]?.text === text
                ? searchHistory[historyIndex]
                : newWord({
                    text,
                    title: 'Saladict',
                    favicon: 'https://saladict.crimx.com/favicon.ico'
                  })
          }
        })
        return isPopupPage() ? Promise.resolve(true) : Promise.resolve()
      }

      case 'WORD_SAVED': {
        const { text } = getState()
        if (text) {
          message
            .send<'IS_IN_NOTEBOOK'>({
              type: 'IS_IN_NOTEBOOK',
              payload: newWord({ text })
            })
            .then(isInNotebook => {
              dispatch({ type: 'WORD_IN_NOTEBOOK', payload: isInNotebook })
            })
        }
        break
      }

      case 'ADD_NOTEBOOK': {
        if (msg.payload.popup === isPopupPage()) {
          dispatch({ type: 'ADD_TO_NOTEBOOK' })
          return Promise.resolve(true)
        }
        return
      }

      case 'QS_PANEL_SEARCH_TEXT':
        if (isQuickSearchPage()) {
          // request searching text, from other tabs
          dispatch({ type: 'SEARCH_START', payload: { word: msg.payload } })

          if (getState().isQSFocus) {
            // focus standalone panel
            message.send({ type: 'OPEN_QS_PANEL' })
          }
        }
        return Promise.resolve()

      case 'QS_PANEL_CHANGED':
        if (!isQuickSearchPage()) {
          dispatch({ type: 'QS_PANEL_CHANGED', payload: msg.payload })
        }
        return Promise.resolve()

      case 'QS_PANEL_FOCUSED':
        if (isQuickSearchPage()) {
          const input = document.querySelector<
            HTMLTextAreaElement | HTMLInputElement
          >(
            getState().isExpandMtaBox
              ? '.mtaBox-TextArea'
              : '.menuBar-SearchBox'
          )
          if (input) {
            input.focus()
            input.select()
          }
        }
        return Promise.resolve()

      case 'GET_TAB_BADGE_INFO': {
        const state = getState()
        return Promise.resolve<MessageResponse<'GET_TAB_BADGE_INFO'>>({
          active: state.config.active,
          tempDisable: state.isTempDisabled,
          unsupported: isStandalonePage()
            ? false
            : document.body.tagName !== 'BODY'
        })
      }
    }
  })

  /**
   * Date of last instant capture.
   * To skip extra event after resuming selection
   */
  let lastInstantDate = 0

  message.self.addListener(msg => {
    switch (msg.type) {
      case 'SELECTION':
        if (msg.payload.instant) {
          lastInstantDate = Date.now()
        } else if (Date.now() - lastInstantDate < 500) {
          return Promise.resolve()
        }
        dispatch({ type: 'NEW_SELECTION', payload: msg.payload })
        return Promise.resolve()

      case 'ESCAPE_KEY':
        dispatch({ type: 'CLOSE_PANEL' })
        return Promise.resolve()

      case 'SEARCH_TEXT':
        dispatch({ type: 'SEARCH_START', payload: { word: msg.payload } })
        return Promise.resolve()

      case 'CLOSE_PANEL':
        dispatch({ type: 'CLOSE_PANEL' })
        return Promise.resolve()

      case 'TRIPLE_CTRL':
        if (!isPopupPage() && !isOptionsPage()) {
          const state = getState()
          if (state.config.tripleCtrl) {
            if (state.config.qsStandalone) {
              // focus if the standalone panel is already opened
              message.send({ type: 'OPEN_QS_PANEL' })
            } else if (!state.isShowDictPanel) {
              dispatch({ type: 'OPEN_QS_PANEL' })
              initTripleCtrl(dispatch, state)
            }
          }
        }
        return Promise.resolve()

      case 'UPDATE_WORD_EDITOR_WORD':
        dispatch({ type: 'WORD_EDITOR_STATUS', payload: msg.payload })
        return timer(100).then(() => {
          // wait till snapshot is taken
          dispatch({
            type: 'SEARCH_START',
            payload: { word: msg.payload.word }
          })
        })

      case 'LAST_PLAY_AUDIO':
        return Promise.resolve(getState().lastPlayAudio)
    }
  })

  if (isPopupPage()) {
    initPopup(dispatch, getState())
  } else if (isQuickSearchPage()) {
    initStandaloneQuickSearch(dispatch, getState())
  } else {
    message
      .send<'QUERY_QS_PANEL'>({ type: 'QUERY_QS_PANEL' })
      .then(response =>
        dispatch({ type: 'QS_PANEL_CHANGED', payload: response })
      )
  }
}

async function initStandaloneQuickSearch(
  dispatch: StoreDispatch,
  state: StoreState
) {
  let word: Word | null = null

  const { searchParams } = new URL(document.URL)

  if (!searchParams.get('sidebar')) {
    // pin panel if not sidebar mode
    dispatch({ type: 'TOGGLE_PIN' })
  }

  const wordString = searchParams.get('word')
  if (wordString) {
    try {
      word = JSON.parse(decodeURIComponent(wordString))
    } catch (error) {
      if (process.env.DEBUG) {
        console.warn(error)
      }
      word = null
    }
  }

  if (!word) {
    if (state.config.qsPreload === 'selection') {
      const lastTab = Number(searchParams.get('lastTab'))
      if (lastTab) {
        word = await message.send<'PRELOAD_SELECTION'>(lastTab, {
          type: 'PRELOAD_SELECTION'
        })
      }
    } else if (state.config.qsPreload === 'clipboard') {
      word = newWord({
        text: await message.send<'GET_CLIPBOARD'>({ type: 'GET_CLIPBOARD' }),
        title: 'From Clipboard'
      })
    }
  }

  if (word) {
    if (word.text && (state.config.qsAuto || wordString)) {
      dispatch({ type: 'SEARCH_START', payload: { word } })
    } else {
      dispatch({ type: 'SUMMONED_PANEL_INIT', payload: word.text })
    }
  }
}

async function initPopup(dispatch: StoreDispatch, state: StoreState) {
  let word: Word | null = null

  if (state.config.baPreload === 'selection') {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true
      })
    )[0]
    if (tab && tab.id != null) {
      word = await message.send<'PRELOAD_SELECTION'>(tab.id, {
        type: 'PRELOAD_SELECTION'
      })
    }
  } else if (state.config.baPreload === 'clipboard') {
    word = newWord({
      text: await message.send<'GET_CLIPBOARD'>({ type: 'GET_CLIPBOARD' }),
      title: 'From Clipboard'
    })
  }

  if (word) {
    if (word.text && state.config.baAuto) {
      dispatch({ type: 'SEARCH_START', payload: { word } })
    } else {
      dispatch({ type: 'SUMMONED_PANEL_INIT', payload: word.text })
    }
  }
}

async function initTripleCtrl(dispatch: StoreDispatch, state: StoreState) {
  let word: Word | null = null

  if (state.config.qsPreload === 'selection') {
    if (state.selection.word) {
      word = state.selection.word
    }
  } else if (state.config.qsPreload === 'clipboard') {
    word = newWord({
      text: await message.send<'GET_CLIPBOARD'>({ type: 'GET_CLIPBOARD' }),
      title: 'From Clipboard'
    })
  }

  if (word) {
    if (word.text && state.config.qsAuto) {
      dispatch({ type: 'SEARCH_START', payload: { word } })
    } else {
      dispatch({ type: 'SUMMONED_PANEL_INIT', payload: word.text })
    }
  }
}
