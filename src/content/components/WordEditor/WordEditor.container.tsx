import { connect } from 'react-redux'
import {
  ExtractDispatchers,
  MapStateToProps,
  MapDispatchToProps
} from 'react-retux'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { WordEditorPortal, WordEditorPortalProps } from './WordEditor.portal'

type Dispatchers = ExtractDispatchers<WordEditorPortalProps, 'onClose'>

const mapStateToProps: MapStateToProps<
  StoreState,
  WordEditorPortalProps,
  Dispatchers
> = state => ({
  show: state.wordEditor.isShow,
  darkMode: state.config.darkMode,
  withAnimation: state.config.animation,
  colors: state.colors,
  containerWidth: window.innerWidth - state.config.panelWidth - 100,
  ctxTrans: state.config.ctxTrans,
  wordEditor: state.wordEditor
})

const mapDispatchToProps: MapDispatchToProps<
  StoreAction,
  WordEditorPortalProps,
  Dispatchers
> = dispatch => ({
  onClose: () => {
    dispatch({ type: 'WORD_EDITOR_STATUS', payload: { word: null } })
  }
})

export const WordEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WordEditorPortal)

export default WordEditorContainer
