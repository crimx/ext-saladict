import React, { FC, ComponentProps, useCallback } from 'react'
import { timer, reflect } from '@/_helpers/promise-more'

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
  if (!props.src) return null

  const width = props.width || props.height || '1.2em'
  const height = props.height || width

  return (
    <a
      className="saladict-Speaker"
      href={props.src}
      target="_blank"
      rel="noopener noreferrer"
      style={{ width, height }}
    ></a>
  )
}

export default React.memo(Speaker)

export interface StaticSpeakerContainerProps
  extends Omit<ComponentProps<'div'>, 'onClick'> {
  onPlayStart: (src: string) => Promise<void>
}

/**
 * Listens to HTML injected Speakers in childern
 */
export const StaticSpeakerContainer: FC<
  StaticSpeakerContainerProps
> = props => {
  const { onPlayStart, ...restProps } = props

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        e.target &&
        e.target['tagName'] === 'A' &&
        e.target['href'] &&
        e.target['classList'] &&
        e.target['classList'].contains('saladict-Speaker')
      ) {
        e.preventDefault()
        e.stopPropagation()

        const target = e.target as HTMLAnchorElement
        target.classList.add('isActive')

        reflect([timer(1000), onPlayStart(target.href)]).then(() => {
          target.classList.remove('isActive')
        })

        const selection = window.getSelection()
        if (selection) {
          // prevent searching words
          selection.removeAllRanges()
        }
      }
    },
    [onPlayStart]
  )

  return <div onClick={onClick} {...restProps} />
}

/**
 * Returns a anchor element
 */
export const getStaticSpeaker = (src?: string | null) => {
  if (!src) {
    return ''
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
  src
    ? `<a href="${src}" target="_blank" rel="noopener noreferrer" class="saladict-Speaker"></a>`
    : ''
