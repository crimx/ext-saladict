import { switchMap } from 'rxjs/operators'
import { EMPTY, of } from 'rxjs'
import { StoreAction, StoreState } from '../modules'
import { Epic, ofType } from './utils'
import { message } from '@/_helpers/browser-api'
import { isStandalonePage, isOptionsPage } from '@/_helpers/saladict'

export const newSelectionEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType('NEW_SELECTION'),
    // Selection may be skipped in state, use payload instead.
    switchMap(({ payload: selection }) => {
      const { config, withQssaPanel, isShowDictPanel, isPinned } = state$.value

      if (selection.self) {
        // Selection inside dict panel.
        return selectionInsideDictPanel(config, selection)
      }

      if (isOptionsPage()) {
        return EMPTY
      }

      if (withQssaPanel && config.qssaPageSel) {
        // standalone panel takes control
        return selectionToQSPanel(config, selection)
      }

      if (isStandalonePage()) {
        return EMPTY
      }

      const { pinMode } = config

      if (
        isShowDictPanel &&
        selection.word &&
        selection.word.text &&
        (!isPinned ||
          pinMode.direct ||
          (pinMode.double && selection.dbClick) ||
          (pinMode.holding.alt && selection.altKey) ||
          (pinMode.holding.shift && selection.shiftKey) ||
          (pinMode.holding.ctrl && selection.ctrlKey) ||
          (pinMode.holding.meta && selection.metaKey))
      ) {
        // continue searching
        return of<StoreAction>({
          type: 'SEARCH_START',
          payload: { word: selection.word }
        })
      }

      return EMPTY
    })
  )

export default newSelectionEpic

function selectionInsideDictPanel(
  config: StoreState['config'],
  selection: StoreState['selection']
): ReturnType<Epic> {
  // inside dict panel
  const { direct, double, holding } = config.panelMode
  if (
    selection.word &&
    selection.word.text &&
    (selection.instant ||
      direct ||
      (double && selection.dbClick) ||
      (holding.alt && selection.altKey) ||
      (holding.shift && selection.shiftKey) ||
      (holding.ctrl && selection.ctrlKey) ||
      (holding.meta && selection.metaKey))
  ) {
    return of<StoreAction>({
      type: 'SEARCH_START',
      payload: {
        word: {
          ...selection.word,
          title: 'Saladict Panel',
          favicon: 'https://saladict.crimx.com/favicon.ico'
        }
      }
    })
  }
  return EMPTY
}

function selectionToQSPanel(
  config: StoreState['config'],
  selection: StoreState['selection']
): ReturnType<Epic> {
  // standalone panel takes control
  const { direct, double, holding } = config.qsPanelMode
  if (
    selection.word &&
    selection.word.text &&
    (selection.instant ||
      direct ||
      (double && selection.dbClick) ||
      (holding.alt && selection.altKey) ||
      (holding.shift && selection.shiftKey) ||
      (holding.ctrl && selection.ctrlKey) ||
      (holding.meta && selection.metaKey))
  ) {
    message.send({
      type: 'QS_PANEL_SEARCH_TEXT',
      payload: selection.word
    })
  }
  return EMPTY
}
