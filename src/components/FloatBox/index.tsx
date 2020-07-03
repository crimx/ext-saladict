import React, { FC, Ref, useState, useCallback } from 'react'
import { ResizeReporter } from 'react-resize-reporter/scroll'

export interface FloatBoxProps {
  list?: Array<{ key: string; content: React.ReactNode }>
  /** Box container */
  ref?: Ref<HTMLDivElement>
  /** When a item is selected */
  onSelect?: (key: string) => any
  /** When a item is focused */
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => any
  /** When a item is blur */
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => any
  /** When mouse over on panel */
  onMouseOver?: (e: React.MouseEvent<HTMLDivElement>) => any
  /** When mouse out on panel */
  onMouseOut?: (e: React.MouseEvent<HTMLDivElement>) => any
  /** When ArrowUp key if pressed on the first item */
  onArrowUpFirst?: (container: HTMLDivElement) => any
  /** When ArrowDown key if pressed on the last item */
  onArrowDownLast?: (container: HTMLDivElement) => any
  /** When the panel is about to close */
  onClose?: (container: HTMLDivElement) => any
  /** When box height is changed */
  onHeightChanged?: (height: number) => any
}

/**
 * A white box
 */
export const FloatBox: FC<FloatBoxProps> = React.forwardRef(
  (props: FloatBoxProps, containerRef: React.Ref<HTMLDivElement>) => {
    const [height, _setHeight] = useState(0)
    const [width, _setWidth] = useState(0)
    const updateHeight = useCallback(
      (newWidth: number, newHeight: number) => {
        _setWidth(newWidth)
        _setHeight(newHeight)
        if (props.onHeightChanged && newHeight !== height) {
          props.onHeightChanged(newHeight + 20) // plus paddings
        }
      },
      [props.onHeightChanged]
    )

    return (
      <div
        className="floatBox-Container"
        style={{ width, height }}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
      >
        <div className="floatBox-Measure">
          <ResizeReporter reportInit onSizeChanged={updateHeight} />

          {!props.list ? (
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <div ref={containerRef} className="floatBox">
              {props.list.map(item => (
                <button
                  key={item.key}
                  className="floatBox-Btn"
                  onFocus={props.onFocus}
                  onBlur={props.onBlur}
                  onClick={e =>
                    props.onSelect &&
                    props.onSelect(e.currentTarget.dataset.key!)
                  }
                  onKeyDown={e => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      e.stopPropagation()
                      const $nextLi = e.currentTarget.nextSibling
                      if ($nextLi) {
                        ;($nextLi as HTMLButtonElement).focus()
                      } else if (props.onArrowDownLast) {
                        props.onArrowDownLast(
                          e.currentTarget.parentElement as HTMLDivElement
                        )
                      }
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      e.stopPropagation()
                      const $prevLi = e.currentTarget.previousSibling
                      if ($prevLi) {
                        ;($prevLi as HTMLButtonElement).focus()
                      } else if (props.onArrowUpFirst) {
                        props.onArrowUpFirst(
                          e.currentTarget.parentElement as HTMLDivElement
                        )
                      }
                    } else if (e.key === 'Escape') {
                      // prevent the dict panel being closed
                      e.preventDefault()
                      e.stopPropagation()
                      if (props.onClose) {
                        props.onClose(
                          e.currentTarget.parentElement as HTMLDivElement
                        )
                      }
                    }
                  }}
                  data-key={item.key}
                >
                  {item.content}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
