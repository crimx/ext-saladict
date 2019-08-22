import { connect } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'
import { DictList, DictListProps } from './DictList'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { message } from '@/_helpers/browser-api'
import memoizeOne from 'memoize-one'

const memoizedDicts = memoizeOne(
  (
    renderedDicts: StoreState['renderedDicts'],
    allDict: StoreState['activeProfile']['dicts']['all']
  ) =>
    renderedDicts.map(dict => ({
      dictID: dict.id,
      searchStatus: dict.searchStatus,
      searchResult: dict.searchResult,
      preferredHeight: allDict[dict.id].preferredHeight
    }))
)

type Dispatchers = 'searchText' | 'openDictSrcPage'

const mapStateToProps = (
  state: StoreState
): Omit<DictListProps, Dispatchers> => ({
  fontSize: state.config.fontSize,
  withAnimation: state.config.animation,
  dicts: memoizedDicts(state.renderedDicts, state.activeProfile.dicts.all)
})

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StoreState, {}, StoreAction>
): Pick<DictListProps, Dispatchers> => ({
  searchText: payload => {
    dispatch({ type: 'SEARCH_START', payload })
  },
  openDictSrcPage: id => {
    dispatch((dispatch, getState) => {
      const { searchHistory } = getState()
      const word = searchHistory[searchHistory.length - 1]
      message.send({
        type: 'OPEN_DICT_SRC_PAGE',
        payload: {
          id,
          text: word && word.text ? word.text : ''
        }
      })
    })
  }
})

export const DictListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DictList)

export default DictListContainer
