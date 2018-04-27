import React from 'react'
import ReactDOM from 'react-dom'
import { shallow } from 'enzyme'
import SaladBowlPortal from '@/content/components/SaladBowlPortal'
import noop from 'lodash/noop'

jest.mock('react-dom')
const createPortal = ReactDOM.createPortal as jest.Mock<typeof ReactDOM.createPortal>

describe('Component/content/SaladBowlPortal', () => {
  beforeEach(() => {
    browser.flush()
    createPortal.mockClear()
  })

  it('should pop in', () => {
    const props = {
      shouldShow: true,
      mouseX: 0,
      mouseY: 0,
      isMount: true,
      isAppear: false,
      mouseOnBowl: noop,
      searchText: noop,
    }
    const portalBowl = shallow(<SaladBowlPortal {...props} />)

    expect(createPortal).toHaveBeenCalledTimes(1)

    const bowlProps = createPortal.mock.calls[0][0].props
    expect(bowlProps.x).toBeGreaterThan(0)
    expect(bowlProps.y).toBeGreaterThan(0)
    expect(bowlProps.scale).toBe(1)
  })

  it('should always within viewport', () => {
    const props = {
      shouldShow: true,
      mouseX: 0,
      mouseY: 0,
      isMount: true,
      isAppear: false,
      mouseOnBowl: noop,
      searchText: noop,
    }
    const portalBowl = shallow(<SaladBowlPortal {...props} />)

    portalBowl.setProps({ shouldShow: true, mouseX: window.innerWidth, mouseY: 0 })
    portalBowl.setProps({ shouldShow: true, mouseX: window.innerWidth, mouseY: window.innerHeight })
    portalBowl.setProps({ shouldShow: true, mouseX: 0, mouseY: window.innerHeight })

    expect(createPortal).toHaveBeenCalledTimes(4)

    for (let i = 1; i < 4; i++) {
      const bowlProps = createPortal.mock.calls[i][0].props
      expect(bowlProps.x).toBeGreaterThan(0)
      expect(bowlProps.x).toBeLessThan(window.innerWidth)
      expect(bowlProps.y).toBeGreaterThan(0)
      expect(bowlProps.y).toBeLessThan(window.innerHeight)
      expect(bowlProps.scale).toBe(1)
    }
  })
})
