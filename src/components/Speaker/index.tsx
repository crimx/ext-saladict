import React, {
  FC,
  ComponentProps,
  useCallback,
  useState,
  useContext
} from 'react'
import { useUpdateEffect } from 'react-use'
import { timer, reflect } from '@/_helpers/promise-more'

/** onPlayStart */
const StaticSpeakerContext = React.createContext<
  (src: string) => Promise<void>
>(async () => {})

export interface SpeakerProps {
  /** render nothing when no src */
  readonly src?: string | (() => Promise<string>)
  /** @default 1.2em */
  readonly width?: number | string
  /** @default 1.2em */
  readonly height?: number | string
}

/**
 * Speaker for playing audio files
 */
export const Speaker: FC<SpeakerProps> = props => {
  const [src, setSrc] = useState(() =>
    typeof props.src === 'string' ? props.src : '#'
  )

  const onPlayStart = useContext(StaticSpeakerContext)

  useUpdateEffect(() => {
    setSrc(typeof props.src === 'string' ? props.src : '#')
  }, [props.src])

  if (!props.src) return null

  const width = props.width || props.height || '1.2em'
  const height = props.height || width

  return (
    <a
      className="saladict-Speaker"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      style={{ width, height }}
      onClick={async e => {
        if (src === '#' && typeof props.src === 'function') {
          e.stopPropagation()
          e.preventDefault()
          const result = await props.src()
          onPlayStart(result)
          setSrc(result)
        }
      }}
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
export const StaticSpeakerContainer: FC<StaticSpeakerContainerProps> = props => {
  const { onPlayStart, ...restProps } = props

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        e.target &&
        e.target['tagName'] === 'A' &&
        e.target['href'] &&
        e.target['href'] !== '#' &&
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
      }
    },
    [onPlayStart]
  )

  return (
    <StaticSpeakerContext.Provider value={onPlayStart}>
      <div onClick={onClick} {...restProps} />
    </StaticSpeakerContext.Provider>
  )
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
