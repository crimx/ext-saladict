import fetchDom from '../../../src/_helpers/fetch-dom'

class XMLHttpRequestMock {
  static queue: XMLHttpRequestMock[] = []
  static lastXhr: XMLHttpRequestMock

  status: number
  responseType: string
  responseXML: Document
  onload: Function
  onerror: Function
  send = jest.fn(() => {
    XMLHttpRequestMock.queue.push(this)
    XMLHttpRequestMock.lastXhr = this
  })
  open = jest.fn()

  static response (isSuccess, res) {
    if (isSuccess) {
      XMLHttpRequestMock.queue.forEach(xhr => {
        xhr.status = res.status
        if (res.body) {
          xhr.responseXML = document.implementation.createHTMLDocument('')
          xhr.responseXML.body.innerHTML = res.body
        }
        xhr.onload()
      })
    } else {
      XMLHttpRequestMock.queue.forEach(xhr => {
        xhr.onerror(new Error(res))
      })
    }
    XMLHttpRequestMock.queue = []
  }
  static flush () {
    XMLHttpRequestMock.queue = []
  }
}

describe('Fetch DOM', () => {
  const bakXMLHttpRequest = (window as any).XMLHttpRequest
  beforeAll(() => {
    (window as any).XMLHttpRequest = XMLHttpRequestMock
  })
  afterAll(() => {
    (window as any).XMLHttpRequest = bakXMLHttpRequest
  })
  beforeEach(() => {
    XMLHttpRequestMock.flush()
  })

  describe('GET', () => {
    it('Success', () => {
      const url = 'https://example.com/res'
      const resolveSpy = jest.fn(doc => {
        expect(doc.getElementById('app').textContent).toBe('HEY')
      })
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      const p = fetchDom(url)
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toHaveBeenCalledTimes(1)
          expect(rejectSpy).toHaveBeenCalledTimes(0)
          expect(catchSpy).toHaveBeenCalledTimes(0)
        })

      XMLHttpRequestMock.response(true, {
        status: 200,
        body: '<div id="app">HEY</div>',
      })
      const xhr = XMLHttpRequestMock.lastXhr
      expect(xhr.send).toHaveBeenCalledTimes(1)
      expect(xhr.responseType).toBe('document')
      expect(xhr.open).toHaveBeenCalledWith('GET', url)

      return p
    })
    it('Failed', () => {
      const url = 'https://example.com/res'
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      const p = fetchDom(url)
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toHaveBeenCalledTimes(0)
          expect(rejectSpy).toHaveBeenCalledTimes(1)
          expect(catchSpy).toHaveBeenCalledTimes(0)
        })

      XMLHttpRequestMock.response(true, {
        status: 404
      })
      const xhr = XMLHttpRequestMock.lastXhr
      expect(xhr.send).toHaveBeenCalledTimes(1)
      expect(xhr.responseType).toBe('document')
      expect(xhr.open).toHaveBeenCalledWith('GET', url)

      return p
    })
  })

  describe('POST', () => {
    it('Success', () => {
      const url = 'https://example.com/res'
      const resolveSpy = jest.fn(doc => {
        expect(doc.getElementById('app').textContent).toBe('HEY')
      })
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      const p = fetchDom(url, { method: 'post', body: 'request body' })
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toHaveBeenCalledTimes(1)
          expect(rejectSpy).toHaveBeenCalledTimes(0)
          expect(catchSpy).toHaveBeenCalledTimes(0)
        })

      XMLHttpRequestMock.response(true, {
        status: 200,
        body: '<div id="app">HEY</div>',
      })
      const xhr = XMLHttpRequestMock.lastXhr
      expect(xhr.send).toHaveBeenCalledTimes(1)
      expect(xhr.send).toHaveBeenCalledWith('request body')
      expect(xhr.responseType).toBe('document')
      expect(xhr.send).toHaveBeenCalledTimes(1)
      expect(xhr.open).toHaveBeenCalledWith('POST', url)

      return p
    })
    it('Failed', () => {
      const url = 'https://example.com/res'
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      const p = fetchDom(url, { method: 'post'})
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toHaveBeenCalledTimes(0)
          expect(rejectSpy).toHaveBeenCalledTimes(1)
          expect(catchSpy).toHaveBeenCalledTimes(0)
        })

      XMLHttpRequestMock.response(true, {
        status: 404
      })
      const xhr = XMLHttpRequestMock.lastXhr
      expect(xhr.send).toHaveBeenCalledTimes(1)
      expect(xhr.responseType).toBe('document')
      expect(xhr.open).toHaveBeenCalledWith('POST', url)

      return p
    })
  })
})
