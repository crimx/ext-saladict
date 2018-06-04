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

  it('should render correctly', () => {
    const props = {
      shouldShow: true,
      mouseOnBowl: noop,
      isAnimation: true,
      bowlRect: { x: 12, y: 12 }
    }
    const portalBowl = shallow(<SaladBowlPortal {...props} />)

    expect(createPortal).toHaveBeenCalledTimes(1)
  })
})
