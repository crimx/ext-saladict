import React from 'react'
import { shallow } from 'enzyme'

import { MenuBar } from '@/content/components/MenuBar'

describe('Component/content/MenuBar', () => {
  it('should render correctly', () => {
    const noop = () => {/* noop */}
    const props = {
      t: x => x,
      isFav: false,
      isPinned: false,
      updateDragArea: noop,
      searchText: noop,
      addToNotebook: noop,
      removeFromNotebook: noop,
      shareImg: noop,
      pinPanel: noop,
      closePanel: noop,
    }
    expect(shallow(<MenuBar {...props}/>)).toMatchSnapshot()
  })

  it('should render correctly with fav and pin', () => {
    const noop = () => {/* noop */}
    const props = {
      t: x => x,
      isFav: true,
      isPinned: true,
      updateDragArea: noop,
      searchText: noop,
      addToNotebook: noop,
      removeFromNotebook: noop,
      shareImg: noop,
      pinPanel: noop,
      closePanel: noop,
    }
    expect(shallow(<MenuBar {...props}/>)).toMatchSnapshot()
  })
})
