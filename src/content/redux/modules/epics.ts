import { StoreAction, StoreState } from '.'
import { combineEpics } from 'redux-observable'
import { mapTo, switchMap, map, share, take, filter, tap } from 'rxjs/operators'
import { ofType } from '../utils/operators'
import { merge, from, Observable } from 'rxjs'
import { isInNotebook } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'
import { isPDFPage } from '@/_helpers/saladict'
import { DictID } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'

export const epics = combineEpics<StoreAction, StoreAction, StoreState>(
  /** Start searching text. This will also send to Redux. */
  action$ =>
    action$.pipe(
      ofType('WIDGET/BOWL_ACTIVATED'),
      mapTo({ type: 'WIDGET/SEARCH_START' })
    ),
  (action$, state$) =>
    action$.pipe(
      ofType('WIDGET/SEARCH_START'),
      switchMap(({ payload }) => {
        const {
          widget,
          config: { config }
        } = state$.value
        const word = widget.searchHistory[widget.historyIndex]

        const toStart = new Set<DictID>()
        for (const d of state$.value.widget.renderedDicts) {
          if (d.searchStatus === 'SEARCHING') {
            toStart.add(d.id)
          }
        }

        const { cn, en, machine } = config.autopron
        if (cn.dict) toStart.add(cn.dict)
        if (en.dict) toStart.add(en.dict)
        if (machine.dict) toStart.add(machine.dict)

        const searchResults$$ = merge(
          ...[...toStart].map(id =>
            message
              .send({
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
              .catch(() => ({ id, result: null, audio: null }))
          )
        ).pipe(share())

        const playAudio$ = searchResults$$.pipe(
          filter(({ id, audio, result }) => {
            if (!audio) return false
            if (id === cn.dict && audio.py) return true
            if (id === en.dict && (audio.uk || audio.us)) return true
            return (
              id === machine.dict &&
              !!(result as MachineTranslateResult<DictID>)[machine.src].audio
            )
          }),
          take(1),
          tap(({ id, audio, result }) => {
            if (id === cn.dict) {
              return message.send({ type: 'PLAY_AUDIO', payload: audio!.py! })
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
              payload: (result as MachineTranslateResult<DictID>)[machine.src]
                .audio!
            })
          }),
          // never passed to down stream
          filter(() => false)
        ) as Observable<never>

        return merge(
          from(isInNotebook(word).catch(() => false)).pipe(
            map(
              (isInNotebook): StoreAction => ({
                type: 'WIDGET/WORD_IN_NOTEBOOK',
                payload: isInNotebook
              })
            )
          ),
          searchResults$$.pipe(
            map(
              ({ id, result }): StoreAction => ({
                type: 'WIDGET/SEARCH_END',
                payload: { id, result }
              })
            )
          ),
          playAudio$
        )
      })
    )
)

export default epics
