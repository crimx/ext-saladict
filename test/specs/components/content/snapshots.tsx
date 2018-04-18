import React from 'react'
import renderer from 'react-test-renderer'

import SaladBowl from '@/content/components/SaladBowl'
import MenuBar from '@/content/components/MenuBar'

describe('content script snapshot testing', () => {
  it('SaladBowl', () => {
    const props = {
      x: 0,
      y: 0,
      scale: 1,
    }
    const tree = renderer.create(<SaladBowl {...props}/>).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('MenuBar', () => {
    const noop = () => {/* noop */}
    const props = {
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
