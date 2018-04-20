import React from 'react'
import { mount, shallow } from 'enzyme'
import { SearchStatus } from '@/content/redux/modules/dictionaries'
import { DictItem, DictItemProps } from '@/content/components/DictItem'
import { TranslationFunction } from 'i18next'
import _ from 'lodash'

const mockDict = jest.fn(({ result }) => result ? 'rendered' : null)

jest.mock('@/components/dictionaries/bing/View.tsx', () => {
  return {
    default: mockDict
  }
})

type TransProps = DictItemProps & { t: TranslationFunction }

describe('Component/content/DictItem', () => {
  beforeEach(() => {
    mockDict.mockClear()
  })
  it('should render pending correctly', () => {
    const props: TransProps = {
      t: _.identity,
      id: 'bing',
      dictURL: 'https://google.com',
      fontSize: 14,
      searchResult: null,
      preferredHeight: 100,
      panelWidth: 400,
      searchStatus: SearchStatus.OnHold,
      updateItemHeight: _.noop,
      requestSearchText: _.noop
    }
    expect(mount(<DictItem {...props} />)).toMatchSnapshot()
  })

  it('should render result correctly', () => {
    const props: TransProps = {
      t: _.identity,
      id: 'bing',
      dictURL: 'https://google.com',
      fontSize: 14,
      searchResult: null,
      preferredHeight: 100,
      panelWidth: 400,
      searchStatus: SearchStatus.Searching,
      updateItemHeight: _.noop,
      requestSearchText: _.noop
    }
    const mounted = mount(<DictItem {...props} />)
    expect(mounted).toMatchSnapshot()
    expect(mounted.state('isUnfold')).toBe(false)

    mounted.setProps({ ...props, searchResult: 'result1', searchStatus: SearchStatus.Finished })
    expect(mounted).toMatchSnapshot()
    expect(mounted.state('isUnfold')).toBe(true)
    setTimeout(() => {
      expect(mockDict).toHaveBeenCalledWith(expect.objectContaining({ result: 'result1' }))
    }, 0)
  })

  it('toggling unfold', () => {
    const props: TransProps = {
      t: _.identity,
      id: 'bing',
      dictURL: 'https://google.com',
      fontSize: 14,
      searchResult: null,
      preferredHeight: 100,
      panelWidth: 400,
      searchStatus: SearchStatus.Searching,
      updateItemHeight: _.noop,
      requestSearchText: jest.fn()
    }
    const shallowed = shallow(<DictItem {...props} />)
    expect(shallowed.state('isUnfold')).toBe(false)

    shallowed.setProps({ ...props, searchStatus: SearchStatus.Finished })
    expect(shallowed.state('isUnfold')).toBe(true)

    shallowed.find('header').simulate('click')
    expect(shallowed.state('isUnfold')).toBe(false)

    // request searching
    expect(props.requestSearchText).toHaveBeenCalledTimes(0)
    shallowed.find('header').simulate('click')
    expect(shallowed.state('isUnfold')).toBe(false)
    expect(props.requestSearchText).toHaveBeenCalledTimes(1)
  })
})
