import React from 'react'
import { shallow } from 'enzyme'

import SaladBowl from '@/content/components/SaladBowl'

describe('Component/content/SaladBowl', () => {
  it('should render correctly', () => {
    const props = {
      x: 0,
      y: 0,
      scale: 1,
    }
    expect(shallow(<SaladBowl {...props}/>)).toMatchSnapshot()
  })
})
