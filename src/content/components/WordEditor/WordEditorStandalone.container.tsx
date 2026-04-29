import { connect } from 'react-redux'
import { MapStateToProps } from 'react-retux'
import { StoreState } from '@/content/redux/modules'
import { WordEditor, WordEditorProps } from './WordEditor'
import { isDarkMode } from '@/_helpers/dark-mode'

const onClose = () => {
  window.close()
}

const mapStateToProps: MapStateToProps<
  StoreState,
  WordEditorProps
> = state => ({
  darkMode: isDarkMode(state.config.darkMode),
  containerWidth: window.innerWidth,
  ctxTrans: state.config.ctxTrans,
  wordEditor: state.wordEditor,
  onClose
})

export const WordEditorStandaloneContainer = connect(mapStateToProps)(
  WordEditor
)

export default WordEditorStandaloneContainer
