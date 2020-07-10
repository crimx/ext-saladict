import {
  switchMap,
  map,
  share,
  take,
  filter,
  tap,
  switchMapTo
} from 'rxjs/operators'
import { merge, from, EMPTY } from 'rxjs'
import { StoreAction } from '../modules'
import { Epic, ofType } from './utils'
import { isInNotebook, saveWord } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'
import {
  isPDFPage,
  isInternalPage,
  isStandalonePage
} from '@/_helpers/saladict'
import { DictID } from '@/app-config'
import { MachineTranslateResult } from '@/components/MachineTrans/engine'
import { MessageResponse } from '@/typings/message'

export const searchStartEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType('SEARCH_START'),
    switchMap(({ payload }) => {
      const {
        config,
        searchHistory,
        historyIndex,
        renderedDicts
      } = state$.value
      const word = searchHistory[historyIndex]

      if (
        config.searchHistory &&
        (!isInternalPage() || isStandalonePage()) &&
        (!browser.extension.inIncognitoContext || config.searchHistoryInco) &&
        (historyIndex <= 0 ||
          searchHistory[historyIndex - 1].text !== word.text ||
          searchHistory[historyIndex - 1].context !== word.context)
      ) {
        saveWord('history', word)
      }

      const toStart = new Set<DictID>()
      for (const d of renderedDicts) {
        if (d.searchStatus === 'SEARCHING') {
          toStart.add(d.id)
        }
      }

      const { cn, en, machine } = config.autopron
      if (cn.dict) toStart.add(cn.dict)
      if (en.dict) toStart.add(en.dict)
      if (machine.dict) toStart.add(machine.dict)

      const searchResults$$ = merge(
        ...[...toStart].map(
          (id): Promise<MessageResponse<'FETCH_DICT_RESULT'>> =>
            message
              .send<'FETCH_DICT_RESULT'>({
                type: 'FETCH_DICT_RESULT',
                payload: {
                  id,
                  text: word.text,
                  payload:
                    payload && payload.payload
                      ? { isPDF: isPDFPage(), ...payload.payload }
                      : { isPDF: isPDFPage() }
                }
              })
              .catch(() => ({ id, result: null }))
        )
      ).pipe(share())

      const playAudio$ =
        payload && payload.id
          ? EMPTY
          : searchResults$$.pipe(
              filter(({ id, audio, result }) => {
                if (!audio) return false
                if (id === cn.dict && audio.py) return true
                if (id === en.dict && (audio.uk || audio.us)) return true
                return (
                  id === machine.dict &&
                  !!(result as MachineTranslateResult<DictID>)[machine.src].tts
                )
              }),
              take(1),
              tap(({ id, audio, result }) => {
                if (id === cn.dict) {
                  return message.send({
                    type: 'PLAY_AUDIO',
                    payload: audio!.py!
                  })
                }

                if (id === en.dict) {
                  const src =
                    en.accent === 'us'
                      ? audio!.us || audio!.uk
                      : audio!.uk || audio!.us
                  return message.send({ type: 'PLAY_AUDIO', payload: src! })
                }

                message.send({
                  type: 'PLAY_AUDIO',
                  payload: (result as MachineTranslateResult<DictID>)[
                    machine.src
                  ].tts!
                })
              }),
              // never pass to down stream
              switchMapTo(EMPTY)
            )

      return merge(
        from(isInNotebook(word).catch(() => false)).pipe(
          map(
            (isInNotebook): StoreAction => ({
              type: 'WORD_IN_NOTEBOOK',
              payload: isInNotebook
            })
          )
        ),
        searchResults$$.pipe(
          map(
            ({ id, result, catalog }): StoreAction => ({
              type: 'SEARCH_END',
              payload: { id, result, catalog }
            })
          )
        ),
        playAudio$
      )
    })
  )

export default searchStartEpic
