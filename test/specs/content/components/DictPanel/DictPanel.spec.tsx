import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import {
  DictPanel,
  DictPanelProps
} from '@/content/components/DictPanel/DictPanel'

describe('DictPanel auto-hide', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    jest.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
    container.remove()
    jest.useRealTimers()
  })

  it('dismisses after leaving the panel', () => {
    const onAutoHide = jest.fn()
    renderPanel({ onAutoHide })

    act(() => {
      dispatchPanelMouse('mouseenter')
      dispatchPanelMouse('mouseleave')
      jest.advanceTimersByTime(599)
    })
    expect(onAutoHide).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onAutoHide).toHaveBeenCalledTimes(1)
  })

  it('cancels dismissal when the pointer re-enters the panel', () => {
    const onAutoHide = jest.fn()
    renderPanel({ onAutoHide })

    act(() => {
      dispatchPanelMouse('mouseenter')
      dispatchPanelMouse('mouseleave')
      dispatchPanelMouse('mouseenter')
      jest.advanceTimersByTime(600)
    })

    expect(onAutoHide).not.toHaveBeenCalled()
  })

  it('cancels pending dismissal when auto-hide is disabled', () => {
    const onAutoHide = jest.fn()
    renderPanel({ onAutoHide })

    act(() => {
      dispatchPanelMouse('mouseenter')
      dispatchPanelMouse('mouseleave')
    })

    renderPanel({ autoHide: false, onAutoHide })
    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(onAutoHide).not.toHaveBeenCalled()
  })

  it('keeps the panel open when keyboard focus enters before dismissal', () => {
    const onAutoHide = jest.fn()
    renderPanel({
      menuBar: <input aria-label="Panel search" />,
      onAutoHide
    })

    act(() => {
      dispatchPanelMouse('mouseenter')
      dispatchPanelMouse('mouseleave')
    })

    const input = container.querySelector('input') as HTMLInputElement
    act(() => {
      input.focus()
      jest.advanceTimersByTime(600)
    })

    expect(onAutoHide).not.toHaveBeenCalled()
  })

  function renderPanel(overrides: Partial<DictPanelProps> = {}) {
    const props: DictPanelProps = {
      coord: { x: 30, y: 30 },
      takeCoordSnapshot: false,
      width: 400,
      height: 300,
      maxHeight: 600,
      fontSize: 14,
      menuBar: null,
      mtaBox: null,
      dictList: null,
      waveformBox: null,
      dragStartCoord: null,
      onDragEnd: jest.fn(),
      autoHide: true,
      onAutoHide: jest.fn(),
      ...overrides
    }

    act(() => {
      ReactDOM.render(<DictPanel {...props} />, container)
    })
  }

  function dispatchPanelMouse(type: 'mouseenter' | 'mouseleave') {
    const panel = container.querySelector(
      '.dictPanel-FloatBox-Container'
    ) as HTMLElement
    panel.dispatchEvent(new MouseEvent(type))
  }
})
