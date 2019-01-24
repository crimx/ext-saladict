import { connect } from 'react-redux'
import WordEditorPortal from '../components/WordEditorPortal'
import { StoreState } from '../redux/modules'
import { closePanel, closeWordEditor, addToNotebook, updateEditorWord } from '../redux/modules/widget'

export const mapStateToProps = ({ config, widget }: StoreState) => {
  return {
    editorWord: widget.editorWord,
    isAnimation: config.animation,
    dictPanelWidth: config.panelWidth,
    ctxTrans: config.ctxTrans,
  }
}

export const mapDispatchToProps = {
  closeDictPanel: closePanel,
  closeModal: closeWordEditor,
  saveToNotebook: addToNotebook,
  updateEditorWord,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WordEditorPortal)
