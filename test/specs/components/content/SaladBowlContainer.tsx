import React from 'react'
import ReactDOM from 'react-dom'
import { shallow, mount, render } from 'enzyme'
import SaladBowlContainer from '@/content/containers/SaladBowlContainer'
import Motion from 'react-motion'

jest.mock('react-dom')
const createPortal = ReactDOM.createPortal as jest.Mock<typeof ReactDOM.createPortal>

describe('Component/content/SaladBowl', () => {
  beforeEach(() => {
    browser.flush()
    createPortal.mockClear()
  })

  it('should pop in', () => {
    const props = {
      shouldShow: true,
      mouseX: 0,
      mouseY: 0,
    }
    const portalBowl = shallow(<SaladBowlContainer {...props} />)

    expect(createPortal).toHaveBeenCalledTimes(1)

    const bowlProps = createPortal.mock.calls[0][0].props
    expect(bowlProps.x).toBeGreaterThan(0)
    expect(bowlProps.y).toBeGreaterThan(0)
    expect(bowlProps.scale.val).toBe(1)
  })

  it('should always within viewport', () => {
    const props = {
      shouldShow: true,
      mouseX: 0,
      mouseY: 0,
    }
    const portalBowl = shallow(<SaladBowlContainer {...props} />)

    portalBowl.setProps({ shouldShow: true, mouseX: window.innerWidth, mouseY: 0 })
    portalBowl.setProps({ shouldShow: true, mouseX: window.innerWidth, mouseY: window.innerHeight })
    portalBowl.setProps({ shouldShow: true, mouseX: 0, mouseY: window.innerHeight })

    expect(createPortal).toHaveBeenCalledTimes(4)

    for (let i = 1; i < 4; i++) {
      const bowlProps = createPortal.mock.calls[i][0].props
      expect(bowlProps.x.val).toBeGreaterThan(0)
      expect(bowlProps.x.val).toBeLessThan(window.innerWidth)
      expect(bowlProps.y.val).toBeGreaterThan(0)
      expect(bowlProps.y.val).toBeLessThan(window.innerHeight)
      expect(bowlProps.scale).toBe(1)
    }
  })
})
