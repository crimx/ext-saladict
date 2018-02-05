import selection from '@/_helpers/selection'

describe('Selection', () => {
  const bakSelection = window.getSelection
  afterAll(() => {
    window.getSelection = bakSelection
  })

  describe('hasSelection', () => {
    it('should return true when there is selection', () => {
      const selectionMock = jest.fn(() => 'selected text')
      window.getSelection = selectionMock
      expect(selection.hasSelection()).toBe(true)
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })
    it('should return false when there is no selection', () => {
      const selectionMock = jest.fn(() => '')
      window.getSelection = selectionMock
      expect(selection.hasSelection()).toBe(false)
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })
    it('should return false when there is empty selection', () => {
      const selectionMock = jest.fn(() => '  \n')
      window.getSelection = selectionMock
      expect(selection.hasSelection()).toBe(false)
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSelectionText', () => {
    it('should return trimmed selection', () => {
      const selectionMock = jest.fn(() =>
        ' \r  \n\n line1\n  line2\n\n line3   \n\n\nline4  \n\n\n\nline5 \n\n \n '
      )
      window.getSelection = selectionMock
      expect(selection.getSelectionText()).toBe('line1\nline2\n\nline3\n\nline4\n\nline5')
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSelectionSentence', () => {
    it('should return the sentence containing the selection text', () => {
      const div = document.createElement('div')
      div.innerHTML = `
        <div>
          Unrelated text
          <p id="p">A paragraph <span id="s">that containing the selection text.</span></p>
          <span>Unrelated text</span>
        </div>
      `
      const selectionMock = jest.fn(() => ({
        anchorNode: (div.querySelector('#p') as HTMLParamElement).firstChild,
        anchorOffset: 2,
        focusNode: (div.querySelector('#s') as HTMLSpanElement).firstChild,
        focusOffset: 4,
        toString: () => 'paragraph that',
      }))
      window.getSelection = selectionMock
      expect(selection.getSelectionSentence())
        .toBe('A paragraph that containing the selection text.')
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })

    it('should ignore non Text anchor node', () => {
      const div = document.createElement('div')
      div.innerHTML = `
        <div>
          Unrelated text
          <p id="p">A paragraph <span id="s">that containing the selection text.</span></p>
          <span>Unrelated text</span>
        </div>
      `
      const selectionMock = jest.fn(() => ({
        anchorNode: (div.querySelector('#p') as HTMLParamElement),
        anchorOffset: 2,
        focusNode: (div.querySelector('#s') as HTMLSpanElement).firstChild,
        focusOffset: 4,
        toString: () => 'paragraph that',
      }))
      window.getSelection = selectionMock
      expect(selection.getSelectionSentence())
        .toBe('paragraph that containing the selection text.')
      expect(selectionMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSelectionInfo', () => {
    afterAll(() => {
      delete window.pageTitle
      delete window.pageURL
      delete window.faviconURL
    })
    it('should return the right info', () => {
      window.pageTitle = 'page title'
      window.pageURL = 'https://page.url'
      delete window.faviconURL
      const div = document.createElement('div')
      div.innerHTML = `
        <div>
          Unrelated text
          <p id="p">A paragraph <span id="s">that containing the selection text.</span></p>
          <span>Unrelated text</span>
        </div>
      `
      const selectionMock = jest.fn(() => ({
        anchorNode: (div.querySelector('#p') as HTMLParamElement).firstChild,
        anchorOffset: 2,
        focusNode: (div.querySelector('#s') as HTMLSpanElement).firstChild,
        focusOffset: 4,
        toString: () => 'paragraph that',
      }))
      window.getSelection = selectionMock
      expect(selection.getSelectionInfo())
        .toEqual({
          text: 'paragraph that',
          context: 'A paragraph that containing the selection text.',
          title: 'page title',
          url: 'https://page.url',
          favicon: '',
          trans: '',
          note: '',
        })
      expect(selectionMock).toHaveBeenCalledTimes(2)
    })
  })
})
