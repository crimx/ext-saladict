import React from 'react'
import renderer from 'react-test-renderer'

import SaladBowl from '@/content/components/SaladBowl'

describe('Component/content/SaladBowl', () => {
  it('should render correctly', () => {
    const props = {
      x: 0,
      y: 0,
      scale: 1,
    }
    const tree = renderer.create(<SaladBowl {...props}/>).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
