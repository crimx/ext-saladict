import React from 'react'
import renderer from 'react-test-renderer'

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
      openSettings: noop,
      addToNotebook: noop,
      openNotebook: noop,
      openHistory: noop,
      shareImg: noop,
      pinPanel: noop,
      closePanel: noop,
    }
    const tree = renderer.create(<MenuBar {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should render correctly with fav and pin', () => {
    const noop = () => {/* noop */}
    const props = {
      t: x => x,
      isFav: true,
      isPinned: true,
      updateDragArea: noop,
      searchText: noop,
      openSettings: noop,
      addToNotebook: noop,
      openNotebook: noop,
      openHistory: noop,
      shareImg: noop,
      pinPanel: noop,
      closePanel: noop,
    }
    const tree = renderer.create(<MenuBar {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
