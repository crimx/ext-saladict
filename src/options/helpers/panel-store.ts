import { useSelector } from 'react-redux'
import { StoreState } from '@/content/redux/modules'

const pickIsShowDictPanel = (state: StoreState): boolean =>
  state.isShowDictPanel

export const useIsShowDictPanel = () => useSelector(pickIsShowDictPanel)
