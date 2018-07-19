export interface SelectionMock {
  hasSelection: jest.Mock
  getSelectionText: jest.Mock
  getSelectionSentence: jest.Mock
  getSelectionInfo: jest.Mock
  getDefaultSelectionInfo: jest.Mock
}

module.exports = jest.genMockFromModule<SelectionMock>('../selection')
