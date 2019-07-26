import React from 'react'
import AnimateHeight from 'react-animate-height'

interface FloatBoxPropsBase {
  /** When a item is focused */
  onFocus: (e: React.FocusEvent<HTMLButtonElement>) => any
  /** When a item is blur */
  onBlur: (e: React.FocusEvent<HTMLButtonElement>) => any
  /** When a item is selected */
  onSelect: (key: string) => any
  /** When ArrowUp key if pressed on the first item */
  onArrowUpFirst?: (container: HTMLDivElement) => any
  /** When ArrowDown key if pressed on the last item */
  onArrowDownLast?: (container: HTMLDivElement) => any
  /** When the panel is about to close */
  onClose?: (container: HTMLDivElement) => any
}

interface FloatBoxPropsWithList extends FloatBoxPropsBase {
  list: Array<{ key: string; content: React.ReactNode }>
  isLoading?: false
}

interface FloatBoxPropsLoading extends FloatBoxPropsBase {
  isLoading: true
}

export type FloatBoxProps = FloatBoxPropsWithList | FloatBoxPropsLoading

/**
 * A white box
 */
export const FloatBox = React.forwardRef(
  (props: FloatBoxProps, containerRef: React.Ref<HTMLDivElement>) => {
    return (
      <div className="menuBar-FloatBoxContainer">
        <AnimateHeight height={props.isLoading ? 32 : 'auto'}>
          {props.isLoading ? (
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
              <div ref={containerRef} className="menuBar-FloatBox">
                {props.list.map(item => (
                  <button
                    key={item.key}
                    className="menuBar-FloatBoxBtn"
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    onClick={e => props.onSelect(e.currentTarget.dataset.key!)}
                    onKeyDown={e => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        e.stopPropagation()
                        const $nextLi = e.currentTarget.nextSibling
                        if ($nextLi) {
                          ; ($nextLi as HTMLButtonElement).focus()
                        } else if (props.onArrowDownLast) {
                          props.onArrowDownLast(e.currentTarget
                            .parentElement as HTMLDivElement)
                        }
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        e.stopPropagation()
                        const $prevLi = e.currentTarget.previousSibling
                        if ($prevLi) {
                          ; ($prevLi as HTMLButtonElement).focus()
                        } else if (props.onArrowUpFirst) {
                          props.onArrowUpFirst(e.currentTarget
                            .parentElement as HTMLDivElement)
                        }
                      } else if (e.key === 'Escape') {
                        // prevent the dict panel being closed
                        e.preventDefault()
                        e.stopPropagation()
                        if (props.onClose) {
                          props.onClose(e.currentTarget
                            .parentElement as HTMLDivElement)
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
        </AnimateHeight>
      </div>
    )
  }
)
