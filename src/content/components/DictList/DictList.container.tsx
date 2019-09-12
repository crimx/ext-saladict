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

type Dispatchers =
  | 'searchText'
  | 'openDictSrcPage'
  | 'onHeightChanged'
  | 'onSpeakerPlay'

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
  },
  onHeightChanged: height => {
    dispatch({
      type: 'UPDATE_PANEL_HEIGHT',
      payload: { area: 'dictlist', height }
    })
  },
  onSpeakerPlay: src => {
    return new Promise(resolve => {
      dispatch((dispatch, getState) => {
        if (getState().isExpandWaveformBox) {
          message.self.send({ type: 'PLAY_AUDIO', payload: src }).then(resolve)
        } else {
          message.send({ type: 'PLAY_AUDIO', payload: src }).then(resolve)
        }
        dispatch({
          type: 'PLAY_AUDIO',
          payload: { src, timestamp: Date.now() }
        })
      })
    })
  }
})

export const DictListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DictList)

export default DictListContainer
