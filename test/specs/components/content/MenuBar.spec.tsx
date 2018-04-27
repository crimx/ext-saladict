import React from 'react'
import { shallow } from 'enzyme'

import { MenuBar } from '@/content/components/MenuBar'
import { getDefaultSelectionInfo } from '@/_helpers/selection'
import { MsgType, MsgSelection } from '@/typings/message'

describe('Component/content/MenuBar', () => {
  it('should render correctly', () => {
    const noop = () => {/* noop */}
    const props = {
      t: x => x,
      isFav: false,
      isPinned: false,
      selection: {
        type: MsgType.Selection,
        selectionInfo: getDefaultSelectionInfo(),
        mouseX: 0,
        mouseY: 0,
        dbClick: false,
        ctrlKey: false,
      } as MsgSelection,
      searchHistory: [],
      handleDragStart: noop,
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
      selection: {
        type: MsgType.Selection,
        selectionInfo: getDefaultSelectionInfo(),
        mouseX: 0,
        mouseY: 0,
        dbClick: false,
        ctrlKey: false,
      } as MsgSelection,
      searchHistory: [],
      handleDragStart: noop,
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
