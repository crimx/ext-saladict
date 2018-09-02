import React from 'react'
import { shallow } from 'enzyme'

import MenuBar, { MenuBarProps } from '@/content/components/MenuBar'
import noop from 'lodash/noop'
import { appConfigFactory } from '@/app-config'

describe('Component/content/MenuBar', () => {
  it('should render correctly', () => {
    const config = appConfigFactory()
    const props: MenuBarProps = {
      t: x => x,
      isFav: false,
      isPinned: false,
      searchHistory: [],
      activeDicts: [config.id],
      activeConfigID: config.id,
      configProfiles: [{ id: config.id, name: config.name }],
      searchBoxText: '',
      searchBoxIndex: 0,

      searchText: noop,
      shareImg: noop,
      closePanel: noop,
      handleDragAreaTouchStart: noop,
      handleDragAreaMouseDown: noop,
      requestFavWord: noop,
      panelPinSwitch: noop,
      searchBoxUpdate: noop,
    }
    expect(shallow(<MenuBar {...props}/>)).toMatchSnapshot()
  })

  it('should render correctly with fav and pin', () => {
    const config = appConfigFactory()
    const props: MenuBarProps = {
      t: x => x,
      isFav: true,
      isPinned: true,
      searchHistory: [],
      activeDicts: [config.id],
      activeConfigID: config.id,
      configProfiles: [{ id: config.id, name: config.name }],
      searchBoxText: '',
      searchBoxIndex: 0,

      searchText: noop,
      shareImg: noop,
      closePanel: noop,
      handleDragAreaTouchStart: noop,
      handleDragAreaMouseDown: noop,
      requestFavWord: noop,
      panelPinSwitch: noop,
      searchBoxUpdate: noop,
    }
    expect(shallow(<MenuBar {...props}/>)).toMatchSnapshot()
  })
})
