import React from 'react'
import { shallow } from 'enzyme'
import noop from 'lodash/noop'

import SaladBowl, { SaladBowlProps } from '@/content/components/SaladBowl'

describe('Component/content/SaladBowl', () => {
  it('should render correctly', () => {
    const props: SaladBowlProps = {
      isAnimation: true,
      mouseOnBowl: noop,
    }
    expect(shallow(<SaladBowl {...props}/>)).toMatchSnapshot()
  })
})
