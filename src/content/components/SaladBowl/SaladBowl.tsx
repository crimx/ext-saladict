import React, { FC } from 'react'
import classnames from 'classnames'
import { useSubscription, useObservableCallback } from 'observable-hooks'
import { hoverWithDelay } from '@/_helpers/observables'
import { SALADICT_EXTERNAL } from '@/_helpers/saladict'

export interface SaladBowlProps {
  /** Viewport based coordinate. */
  readonly x: number
  /** Viewport based coordinate. */
  readonly y: number
  /** React on hover. */
  readonly enableHover: boolean
  /** When bowl is activated via mouse. */
  readonly onActive: () => void
  readonly onHover: (isHover: boolean) => void
}

/**
 * Cute little icon that pops up near the selection.
 */
export const SaladBowl: FC<SaladBowlProps> = props => {
  const [onMouseOverOut, mouseOverOut$] = useObservableCallback<
    boolean,
    React.MouseEvent<HTMLDivElement>
  >(hoverWithDelay)

  useSubscription(mouseOverOut$, active => {
    props.onHover(active)
    if (active) {
      props.onActive()
    }
  })

  return (
    <div
      role="img"
      className={classnames('saladbowl', SALADICT_EXTERNAL, {
        enableHover: props.enableHover
      })}
      style={{ transform: `translate(${props.x}px, ${props.y}px)` }}
      onMouseOver={props.enableHover ? onMouseOverOut : undefined}
      onMouseOut={onMouseOverOut}
      onClick={() => props.onActive()}
    >
      {/* prettier-ignore */}
      <svg viewBox='0 0 612 612' width='30' height='30'>
          <g className='saladbowl-leaf'>
            <path fill='#6bbc57' d='M 577.557 184.258 C 560.417 140.85 519.54 59.214 519.54 59.214 L 519.543 59.204 C 519.543 59.204 436.903 97.626 396.441 120.878 C 366.171 138.274 354.981 169.755 352.221 177.621 C 349.001 186.851 339.891 228.811 358.341 268.481 C 382.271 319.921 409.201 374.521 409.201 374.521 L 409.201 374.531 C 409.201 374.531 464.511 348.701 515.291 323.401 C 554.451 303.891 573.591 265.441 576.821 256.221 C 579.571 248.356 590.398 216.746 577.574 184.271 Z'/>
            <path fill='#bde9b7' d='M 501.052 102.162 L 507.518 104.425 L 426.69 335.38 L 420.224 333.117 Z'/>
          </g>
          <g className='saladbowl-orange'>
            <circle fill='#ffb30d' cx='299.756' cy='198.246' r='178.613'/>
            <circle fill='#fce29c' cx='299.756' cy='198.246' r='155.24'/>
            <path fill='#fcc329' d='M 299.756 189.873 L 341.269 113.475 C 349.169 82.543 324.349 58.588 299.749 57.891 C 275.149 57.201 248.229 82.781 256.489 113.481 L 299.749 189.881 Z M 307.026 194.757 L 393.974 194.757 C 424.928 187.083 434.124 153.681 422.994 131.737 C 411.864 109.795 376.534 98.357 353.5 120.27 L 307.025 194.757 Z M 308.79 203.444 L 354.885 277.168 C 377.925 299.268 410.995 289.438 423.701 268.368 C 436.411 247.298 427.381 211.276 396.591 203.362 L 308.801 203.442 Z M 300.208 206.618 L 259.628 283.516 C 252.098 314.543 277.214 338.193 301.815 338.591 C 326.415 338.991 353.022 313.081 344.392 282.491 L 300.208 206.631 Z M 292.058 203.3 L 205.108 203.415 C 174.163 211.277 165.014 244.54 176.172 266.468 C 187.33 288.396 226.052 300.541 249.056 278.598 L 292.056 203.301 Z M 292.465 194.83 L 246.497 121.024 C 223.494 98.884 190.409 108.658 177.667 129.706 C 164.925 150.753 173.893 186.791 204.669 194.756 L 292.459 194.829 Z'/>
          </g>
          <g className='saladbowl-tomato'>
            <path fill='#a63131' d='M 71.014 337.344 C 147.291 422.594 278.234 429.866 363.482 353.589 L 87.258 44.87 C 2.01 121.15 -5.262 252.092 71.014 337.342 Z'/>
            <path fill='#bc5757' d='M 101.447 310.115 C 162.685 378.555 267.811 384.393 336.251 323.155 L 114.49 75.31 C 46.047 136.55 40.21 241.674 101.447 310.115 Z'/>
            <path fill='#f1d4af' d='M 186.412 237.54 L 151.659 245.444 C 139.989 251.384 139.339 265.51 145.779 273.27 C 152.219 281.028 167.379 282.39 174.599 271.538 L 186.399 237.54 Z M 242.062 269.832 L 223.366 300.175 C 219.439 312.658 229.066 323.018 239.116 323.85 C 249.168 324.685 260.756 314.815 258.061 302.065 L 242.061 269.832 Z M 160.202 178.317 L 130.357 158.837 C 117.98 154.585 107.375 163.939 106.277 173.965 C 105.183 183.99 114.747 195.833 127.563 193.471 L 160.203 178.321 Z'/>
          </g>
          <g className='saladbowl-bowl'>
            <path fill='#2d97b7' d='M 30.857 311.46 C 30.857 429.87 105.371 530.8 209.867 569.52 L 209.867 589.2 L 400.987 589.2 L 400.987 568.9 C 503.595 530.114 576.887 431.202 578.31 314.907 L 589.196 295.97 L 22.804 295.97 L 30.867 309.998 C 30.865 310.488 30.857 310.971 30.857 311.458 Z'/>
            <path fill='#fff' d='M 540.565 321.42 C 540.585 322.587 540.595 323.755 540.595 324.927 C 540.595 405.941 497.513 476.884 433.015 516.122 L 437.178 523.317 C 504.152 482.64 548.895 409.009 548.895 324.927 C 548.895 323.755 548.885 322.587 548.865 321.419 Z M 399.885 532.68 C 388.298 537.31 376.237 541.002 363.793 543.654 L 363.793 544.45 L 364.971 551.893 C 378.481 549.049 391.551 545.018 404.081 539.935 Z'/>
          </g>
        </svg>
    </div>
  )
}
