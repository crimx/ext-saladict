import React, { FC } from 'react'
import { message } from '@/_helpers/browser-api'
import {
  useObservableCallback,
  identity,
  useObservableState,
  useObservable
} from 'observable-hooks'
import { mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'

export interface SpeakerProps {
  /** render nothing when no src */
  readonly src?: string
  /** @default 1.2em */
  readonly width?: number | string
  /** @default 1.2em */
  readonly height?: number | string
}

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
              return message.send({
                type: 'PLAY_AUDIO',
                payload: e.currentTarget.href
              })
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
      className={`icon-Speaker${isPlaying ? ' isActive' : ''}`}
      onClick={onClick}
      style={{ width, height }}
      href={props.src}
      target="_blank"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 58 58"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="icon-Speaker_Body"
          d="M14.35 20.237H5.77c-1.2 0-2.17.97-2.17 2.17v13.188c0 1.196.97 2.168 2.17 2.168h8.58c.387 0 .766.103 1.1.3l13.748 12.8c1.445.85 3.268-.192 3.268-1.87V9.006c0-1.677-1.823-2.72-3.268-1.87l-13.747 12.8c-.334.196-.713.3-1.1.3z"
        />
        <path
          className="icon-Speaker_Wave"
          d="M36.772 39.98c-.31 0-.62-.118-.856-.355-.476-.475-.476-1.243 0-1.716 5.212-5.216 5.212-13.702 0-18.916-.476-.473-.476-1.24 0-1.716.473-.474 1.24-.474 1.715 0 6.162 6.16 6.162 16.185 0 22.347-.234.237-.546.356-.858.356z"
        />
        <path
          className="icon-Speaker_Wave"
          d="M41.07 44.886c-.312 0-.62-.118-.86-.356-.473-.475-.473-1.24 0-1.715 7.573-7.57 7.573-19.89 0-27.462-.473-.474-.473-1.24 0-1.716.478-.473 1.243-.473 1.717 0 8.517 8.52 8.517 22.377 0 30.893-.238.238-.547.356-.857.356z"
        />
        <path
          className="icon-Speaker_Wave"
          d="M44.632 50.903c-.312 0-.622-.118-.858-.356-.475-.474-.475-1.24 0-1.716 5.287-5.283 8.198-12.307 8.198-19.77 0-7.466-2.91-14.49-8.198-19.775-.475-.474-.475-1.24 0-1.715.475-.474 1.24-.474 1.717 0 5.745 5.744 8.91 13.375 8.91 21.49 0 8.112-3.165 15.744-8.91 21.487-.237.238-.547.356-.858.356z"
        />
      </svg>
    </a>
  )
}

export default React.memo(Speaker)
