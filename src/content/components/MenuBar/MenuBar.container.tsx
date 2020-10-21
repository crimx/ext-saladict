import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToPropsFunction
} from 'react-retux'
import { StoreState, StoreDispatch } from '@/content/redux/modules'
import { updateActiveProfileID } from '@/_helpers/profile-manager'
import {
  isStandalonePage,
  isPopupPage,
  isQuickSearchPage
} from '@/_helpers/saladict'
import { newWord } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'
import { MenuBar, MenuBarProps } from './MenuBar'
import { updateConfig } from '@/_helpers/config-manager'
import { timer } from '@/_helpers/promise-more'
import { objectKeys } from '@/typings/helpers'

type Dispatchers = ExtractDispatchers<
  MenuBarProps,
  | 'searchText'
  | 'updateText'
  | 'addToNoteBook'
  | 'switchHistory'
  | 'togglePin'
  | 'toggleQSFocus'
  | 'onClose'
  | 'onSwitchSidebar'
  | 'onSelectProfile'
  | 'onDragAreaMouseDown'
  | 'onDragAreaTouchStart'
  | 'onHeightChanged'
>

const mapStateToProps: MapStateToProps<
  StoreState,
  MenuBarProps,
  Dispatchers
> = state => ({
  text: state.text,
  isInNotebook: state.isFav,
  shouldFocus:
    !state.isExpandMtaBox && // multiline search box must be folded
    (((state.isQSPanel || isQuickSearchPage()) && // is quick search panel
      state.config.qsFocus) ||
      isPopupPage()), // or popup page
  enableSuggest: state.config.searchSuggests,
  isTrackHistory: state.config.searchHistory,
  histories: state.searchHistory,
  historyIndex: state.historyIndex,
  showedDictAuth: state.config.showedDictAuth,
  profiles: state.profiles,
  activeProfileId: state.activeProfile.id,
  isPinned: state.isPinned,
  isQSFocus: state.isQSFocus
})

const mapDispatchToProps: MapDispatchToPropsFunction<
  StoreDispatch,
  MenuBarProps,
  Dispatchers
> = dispatch => ({
  searchText: text => {
    dispatch({
      type: 'SEARCH_START',
      payload: {
        word: newWord({
          text,
          title: 'Saladict',
          favicon: 'https://saladict.crimx.com/favicon.ico'
        })
      }
    })
  },
  updateText: text => {
    dispatch({ type: 'UPDATE_TEXT', payload: text })
  },
  addToNoteBook: () => {
    dispatch({ type: 'ADD_TO_NOTEBOOK' })
  },
  switchHistory: direction => {
    dispatch({ type: 'SWITCH_HISTORY', payload: direction })
  },
  togglePin: () => {
    dispatch({ type: 'TOGGLE_PIN' })
  },
  toggleQSFocus: () => {
    dispatch({ type: 'TOGGLE_QS_FOCUS' })
  },
  onClose: () => {
    if (isStandalonePage()) {
      window.close()
    } else {
      dispatch({ type: 'CLOSE_PANEL' })
    }
  },
  onSwitchSidebar: (side: 'left' | 'right') => {
    message.send({ type: 'QS_SWITCH_SIDEBAR', payload: side })
  },
  onHeightChanged: (height: number) => {
    dispatch({
      type: 'UPDATE_PANEL_HEIGHT',
      payload: {
        area: 'menubar',
        height: 30,
        floatHeight: height
      }
    })
  },
  onDragAreaMouseDown: event => {
    dispatch({
      type: 'DRAG_START_COORD',
      payload: {
        x: event.clientX,
        y: event.clientY
      }
    })
  },
  onDragAreaTouchStart: event => {
    dispatch({
      type: 'DRAG_START_COORD',
      payload: {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      }
    })
  },
  onSelectProfile: id => {
    dispatch(async (dispatch, getState) => {
      const state = getState()
      const { showedDictAuth, dictAuth } = state.config

      // no jumping on popup page which breaks user flow
      if (!showedDictAuth && !isPopupPage()) {
        await updateConfig({
          ...state.config,
          showedDictAuth: true
        })

        if (
          objectKeys(dictAuth).every(id =>
            objectKeys(dictAuth[id]).every(k => !dictAuth[id]?.[k])
          )
        ) {
          message.send({
            type: 'OPEN_URL',
            payload: {
              url: 'options.html?menuselected=DictAuths',
              self: true
            }
          })
          return
        }
      }

      await updateActiveProfileID(id)
      await timer(10)
      dispatch({
        type: 'SEARCH_START',
        payload: {
          word:
            state.searchHistory[state.historyIndex]?.text === state.text
              ? state.searchHistory[state.historyIndex]
              : newWord({
                  text: state.text,
                  title: 'Saladict',
                  favicon: 'https://saladict.crimx.com/favicon.ico'
                })
        }
      })
    })
  }
})

export const MenuBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuBar)

export default MenuBarContainer
