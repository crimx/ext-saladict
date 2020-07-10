import React, { FC, Ref, useState, useCallback } from 'react'
import { ResizeReporter } from 'react-resize-reporter/scroll'
import classnames from 'classnames'

export type FloatBoxItem =
  | {
      // <button>
      key: string
      value: string
      label: React.ReactNode
      options?: undefined
    }
  | {
      // <select>
      key: string
      value: string
      options: Array<{
        value: string
        label: string
      }>
      title?: string
    }

export interface FloatBoxProps {
  list?: FloatBoxItem[]
  /** compact layout */
  compact?: boolean
  /** Box container */
  ref?: Ref<HTMLDivElement>
  /** When a item is selected */
  onSelect?: (key: string, value: string) => any
  /** When a item is focused */
  onFocus?: (e: React.FocusEvent<HTMLButtonElement | HTMLSelectElement>) => any
  /** When a item is blur */
  onBlur?: (e: React.FocusEvent<HTMLButtonElement | HTMLSelectElement>) => any
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
 * A box that is meant to be on top of other elements
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
          props.onHeightChanged(newHeight)
        }
      },
      [props.onHeightChanged]
    )

    return (
      <div
        className={classnames('floatBox-Container', {
          'floatBox-compact': props.compact
        })}
        style={{ width, height }}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
      >
        <div className="floatBox-Measure">
          <ResizeReporter reportInit onSizeChanged={updateHeight} />

          {!props.list ? (
            <div key="loading" className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <div key="box" ref={containerRef} className="floatBox">
              {props.list.map(renderBoxItem)}
            </div>
          )}
        </div>
      </div>
    )

    function renderBoxItem(item: FloatBoxItem) {
      if (item.options) {
        return (
          <select
            key={item.key}
            className="floatBox-Item floatBox-Select"
            data-key={item.key}
            defaultValue={item.value}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            onChange={onSelectItemChange}
          >
            {item.title && <option disabled>{item.title}</option>}
            {item.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      }

      return (
        <button
          key={item.key}
          className="floatBox-Item floatBox-Btn"
          data-key={item.key}
          data-value={item.value}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onClick={onBtnItemClick}
          onKeyDown={onBtnItemKeyDown}
        >
          {item.label}
        </button>
      )
    }

    function onSelectItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
      if (props.onSelect) {
        const {
          dataset: { key },
          value
        } = e.currentTarget
        props.onSelect(key!, value)
      }
    }

    function onBtnItemClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (props.onSelect) {
        const { key, value } = e.currentTarget.dataset
        props.onSelect(key!, value!)
      }
    }

    function onBtnItemKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        const $nextLi = e.currentTarget.nextSibling
        if ($nextLi) {
          ;($nextLi as HTMLButtonElement).focus()
        } else if (props.onArrowDownLast) {
          props.onArrowDownLast(e.currentTarget.parentElement as HTMLDivElement)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        const $prevLi = e.currentTarget.previousSibling
        if ($prevLi) {
          ;($prevLi as HTMLButtonElement).focus()
        } else if (props.onArrowUpFirst) {
          props.onArrowUpFirst(e.currentTarget.parentElement as HTMLDivElement)
        }
      } else if (e.key === 'Escape') {
        // prevent the dict panel being closed
        e.preventDefault()
        e.stopPropagation()
        if (props.onClose) {
          props.onClose(e.currentTarget.parentElement as HTMLDivElement)
        }
      }
    }
  }
)
