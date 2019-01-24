import React from 'react'
import { shallow } from 'enzyme'

import MenuBar, { MenuBarProps } from '@/content/components/MenuBar'
import noop from 'lodash/noop'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, getDefaultProfileID } from '@/app-config/profiles'

describe('Component/content/MenuBar', () => {
  it('should render correctly', () => {
    const config = {
      ...getDefaultConfig(),
      ...getDefaultProfile(),
    }
    const props: MenuBarProps = {
      t: x => x,
      searchSuggests: true,
      isTripleCtrl: true,
      isFav: false,
      isPinned: false,
      searchHistory: [],
      activeDicts: [config.id],
      activeConfigID: config.id,
      profiles: [getDefaultProfileID()],
      searchBoxText: '',
      searchBoxIndex: 0,
      isShowMtaBox: false,

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
    const config = {
      ...getDefaultConfig(),
      ...getDefaultProfile(),
    }
    const props: MenuBarProps = {
      t: x => x,
      searchSuggests: true,
      isTripleCtrl: true,
      isFav: true,
      isPinned: true,
      searchHistory: [],
      activeDicts: [config.id],
      activeConfigID: config.id,
      profiles: [getDefaultProfileID()],
      searchBoxText: '',
      searchBoxIndex: 0,
      isShowMtaBox: true,

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
