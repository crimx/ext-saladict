import { connect } from 'react-redux'
import WordEditorPortal from '../components/WordEditorPortal'
import { StoreState } from '../redux/modules'
import { closePanel, closeWordEditor, addToNotebook } from '../redux/modules/widget'

export const mapStateToProps = ({ config, dictionaries, widget }: StoreState) => {
  return {
    shouldWordEditorShow: widget.shouldWordEditorShow,
    isAnimation: config.animation,
    dictPanelWidth: config.panelWidth,
    info: dictionaries.searchHistory[0],
  }
}

export const mapDispatchToProps = {
  closeDictPanel: closePanel,
  closeModal: closeWordEditor,
  saveToNotebook: addToNotebook,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WordEditorPortal)
