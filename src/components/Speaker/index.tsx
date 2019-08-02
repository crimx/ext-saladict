import React, { FC } from 'react'
import { message } from '@/_helpers/browser-api'
import {
  useObservableCallback,
  identity,
  useObservableState,
  useObservable,
  useSubscription
} from 'observable-hooks'
import { mapTo, switchMap, filter } from 'rxjs/operators'
import { merge, forkJoin, timer } from 'rxjs'

export interface SpeakerProps {
  /** render nothing when no src */
  readonly src?: string
  /** @default 1.2em */
  readonly width?: number | string
  /** @default 1.2em */
  readonly height?: number | string
}

/**
 * Speaker for playing audio files
 */
export const Speaker: FC<SpeakerProps> = props => {
  const [onClick, clickEvent$] = useObservableCallback<
    React.MouseEvent<HTMLAnchorElement>
  >(identity)

  const isPlaying = useObservableState(
    useObservable(() =>
      merge(
        mapTo(true)(clickEvent$),
        mapTo(false)(
          clickEvent$.pipe(
            switchMap(e => {
              e.preventDefault()
              e.stopPropagation()
              return forkJoin(
                timer(1000),
                message.send({
                  type: 'PLAY_AUDIO',
                  payload: e.currentTarget.href
                })
              )
            })
          )
        )
      )
    ),
    false
  )

  const width = props.width || props.height || '1.2em'
  const height = props.height || width

  return (
    <a
      className={`saladict-Speaker${isPlaying ? ' isActive' : ''}`}
      onClick={onClick}
      href={props.src}
      target="_blank"
      style={{
        width,
        height
      }}
    ></a>
  )
}

export default React.memo(Speaker)

/**
 * Listens to HTML injected Speakers in childern
 */
export const StaticSpeakerContainer: FC = props => {
  const [onClick, clickEvent$] = useObservableCallback<
    any,
    React.MouseEvent<HTMLDivElement>
  >(event$ =>
    event$.pipe(
      filter(e =>
        Boolean(
          e.target &&
            e.target['tagName'] === 'A' &&
            e.target['href'] &&
            e.target['classList'] &&
            e.target['classList'].contains('saladict-Speaker')
        )
      ),
      switchMap(e => {
        e.preventDefault()
        e.stopPropagation()
        const target = e.target as HTMLAnchorElement
        target.classList.add('isActive')

        return forkJoin(
          timer(1000),
          message
            .send({
              type: 'PLAY_AUDIO',
              payload: target.href
            })
            .then(() => {
              target.classList.remove('isActive')
            })
        )
      })
    )
  )

  useSubscription(clickEvent$)

  return <div onClick={onClick}>{props.children}</div>
}

/**
 * Returns a anchor element
 */
export const getStaticSpeaker = (src?: string | null) => {
  if (!src) {
    return null
  }

  const $a = document.createElement('a')
  $a.target = '_blank'
  $a.href = src
  $a.className = 'saladict-Speaker'
  return $a
}

/**
 * Returns an anchor element string
 */
export const getStaticSpeakerString = (src?: string | null) =>
  src ? `<a href="${src}" target="_blank" class="saladict-Speaker"></a>` : ''
