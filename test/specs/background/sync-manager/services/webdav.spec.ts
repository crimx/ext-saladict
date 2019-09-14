import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'
import { NotebookFile } from '@/background/sync-manager/interface'
import {
  Service,
  SyncConfig,
  SyncMeta
} from '@/background/sync-manager/services/webdav'
import { Word, newWord } from '@/_helpers/record-manager'

jest.mock('@/background/sync-manager/helpers')

const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

const fetchArgs = {
  checkServer(config: SyncConfig) {
    return [
      config.url,
      {
        method: 'PROPFIND',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
          'Content-Type': 'application/xml; charset="utf-8"',
          Depth: '1'
        }
      }
    ]
  },

  createDir(config: SyncConfig) {
    return [config.url + 'Saladict', { method: 'MKCOL' }]
  },

  upload(config: SyncConfig, body: any = '') {
    return [
      config.url + 'Saladict/notebook.json',
      {
        method: 'PUT',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${config.user}:${config.passwd}`)
        },
        body
      }
    ]
  },

  download(config: SyncConfig, headers: { [index: string]: string } = {}) {
    return [
      config.url + 'Saladict/notebook.json',
      {
        method: 'GET',
        headers: {
          Authorization:
            'Basic ' + window.btoa(`${config.user}:${config.passwd}`),
          ...headers
        }
      }
    ]
  }
}

function mockFetch(
  config: SyncConfig,
  route: Partial<
    {
      [k in keyof typeof fetchArgs]: (
        url: string,
        rqInit?: RequestInit
      ) => Response
    }
  >
) {
  const urltokey: { [key: string]: keyof typeof fetchArgs } = Object.keys(
    fetchArgs
  ).reduce((o, k) => {
    const args = fetchArgs[k](config)
    o[args[0] + ((args[1] && args[1].method) || '')] = k
    return o
  }, {})

  window.fetch = jest.fn(
    (url: string, init?: RequestInit): Promise<Response> => {
      const key = urltokey[url + ((init && init.method) || '')]
      const handler = key && route[key]
      if (handler) {
        return Promise.resolve(handler(url, init))
      }
      return Promise.resolve(new Response())
    }
  ) as any
}

describe('Sync service WebDAV', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.fetch = null as any
  })

  it('upload: should success', async () => {
    const config: SyncConfig = {
      url: 'https://example.com/dav/',
      user: 'user',
      passwd: 'passwd',
      duration: 0
    }

    const fetchInit = {
      upload: jest.fn(() => new Response())
    }
    mockFetch(config, fetchInit)

    const words = [getWord(), getWord({ text: 'word' })]
    helpers.getNotebook.mockImplementationOnce(() => Promise.resolve(words))

    const service = new Service()
    service.config = config

    await service.add({ force: true })

    expect(fetchInit.upload).toHaveBeenCalledTimes(1)
    expect(fetchInit.upload).lastCalledWith(
      ...fetchArgs.upload(
        config,
        expect.stringContaining(JSON.stringify(words))
      )
    )
  })

  describe('download', () => {
    it('should save file on first download', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const words = [
        getWord({
          ...newWord({ text: 'test' }),
          date: Date.now()
        })
      ]
      const timestamp = Date.now()
      const file: NotebookFile = { timestamp, words }

      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(JSON.stringify(file), {
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config

      await service.download({})

      expect(helpers.setNotebook).lastCalledWith(words)
      expect(helpers.setMeta).lastCalledWith('webdav', { timestamp, etag })
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(...fetchArgs.download(config))
    })

    it('should save file if etag changed', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const words = [
        getWord({
          ...newWord({ text: 'test' }),
          date: Date.now()
        })
      ]
      const timestamp = Date.now()
      const file: NotebookFile = { timestamp, words }

      const etagOrigin = 'etag12345'
      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(JSON.stringify(file), {
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.meta = { etag: etagOrigin }

      await service.download({})

      expect(helpers.setNotebook).lastCalledWith(words)
      expect(helpers.setMeta).lastCalledWith('webdav', { timestamp, etag })
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(
        ...fetchArgs.download(config, {
          'If-None-Match': etagOrigin,
          'If-Modified-Since': etagOrigin
        })
      )
    })

    it('should do nothing if 304 (same etag)', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(null, {
              status: 304,
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.meta = { etag }

      await service.download({})

      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(
        ...fetchArgs.download(config, {
          'If-None-Match': etag,
          'If-Modified-Since': etag
        })
      )
    })

    it('should do nothing if etags are different but timestamps are identical', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const file: NotebookFile = {
        timestamp: Date.now(),
        words: [
          {
            ...newWord({ text: 'test' }),
            date: Date.now()
          }
        ]
      }

      const etagOrigin = 'etag12345'
      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(JSON.stringify(file), {
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.meta = {
        etag: etagOrigin,
        timestamp: file.timestamp
      }

      await service.download({})

      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(
        ...fetchArgs.download(config, {
          'If-None-Match': etagOrigin,
          'If-Modified-Since': etagOrigin
        })
      )
    })

    it('should do nothing if etags are different but timestamps are identical', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const file: NotebookFile = {
        timestamp: Date.now(),
        words: [
          getWord({
            ...newWord({ text: 'test' }),
            date: Date.now()
          })
        ]
      }

      const etagOrigin = 'etag12345'
      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(JSON.stringify(file), {
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.meta = {
        etag: etagOrigin,
        timestamp: file.timestamp
      }

      await service.download({})

      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(
        ...fetchArgs.download(config, {
          'If-None-Match': etagOrigin,
          'If-Modified-Since': etagOrigin
        })
      )
    })

    it('should do nothing if words are corrupted', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const file: NotebookFile = {
        timestamp: Date.now(),
        words: ['corrupted format'] as any
      }

      const etag = 'etag222'

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(JSON.stringify(file), {
              headers: {
                etag
              }
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config

      try {
        await service.download({})
      } catch (e) {
        expect(e).toBe('format')
      }

      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(...fetchArgs.download(config))
    })

    it('should do nothing if network failed', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const fetchInit = {
        download: jest.fn(
          () =>
            new Response(null, {
              status: 404
            })
        )
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config

      try {
        await service.download({})
      } catch (e) {
        expect(e).toBe('network')
      }

      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(1)
      expect(fetchInit.download).lastCalledWith(...fetchArgs.download(config))
    })
  })

  describe('initServer', () => {
    it('should create dir and upload files on first init', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const file: NotebookFile = {
        timestamp: Date.now(),
        words: [
          {
            ...newWord({ text: 'test' }),
            date: Date.now()
          }
        ]
      }
      const fileText = JSON.stringify(file)

      const etag = 'etag222'

      const fetchInit = {
        checkServer: jest.fn(() => new Response(genXML())),
        upload: jest.fn(() => new Response()),
        download: jest.fn(
          () =>
            new Response(fileText, {
              headers: {
                etag
              }
            })
        ),
        createDir: jest.fn(() => new Response())
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.download = jest.fn(() => Promise.resolve())

      await service.init(config)

      expect(service.download).toHaveBeenCalledTimes(0)
      expect(fetchInit.checkServer).toHaveBeenCalledTimes(1)
      expect(fetchInit.checkServer).lastCalledWith(
        ...fetchArgs.checkServer(config)
      )
      expect(fetchInit.createDir).toHaveBeenCalledTimes(1)
      expect(fetchInit.createDir).lastCalledWith(...fetchArgs.createDir(config))
      expect(fetchInit.upload).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(1)
      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
    })

    it('should do nothing if local files are older', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const file: NotebookFile = {
        timestamp: Date.now(),
        words: [
          {
            ...newWord({ text: 'test' }),
            date: Date.now()
          }
        ]
      }
      const fileText = JSON.stringify(file)

      const etagLocal = 'etag12345'
      const etag = 'etag222'

      const fetchInit = {
        checkServer: jest.fn(() => new Response(genXML(true))),
        upload: jest.fn(() => new Response()),
        download: jest.fn(
          () =>
            new Response(fileText, {
              headers: {
                etag
              }
            })
        ),
        createDir: jest.fn(() => new Response())
      }

      helpers.getMeta.mockImplementationOnce(
        (): Promise<SyncMeta> =>
          Promise.resolve({
            timestamp: file.timestamp - 100,
            etag: etagLocal
          })
      )
      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.download = jest.fn(() => Promise.resolve())

      await service.init(config)

      expect(service.download).toHaveBeenCalledTimes(0)
      expect(fetchInit.checkServer).toHaveBeenCalledTimes(1)
      expect(fetchInit.checkServer).lastCalledWith(
        ...fetchArgs.checkServer(config)
      )
      // @upstream JSDOM missing namespace selector support
      // expect(fetchInit.createDir).toHaveBeenCalledTimes(0)
      expect(fetchInit.upload).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(1)
      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
    })

    it('should reject with "network" if netword errored', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const fetchInit = {
        checkServer: jest.fn(() => new Response(null, { status: 404 })),
        upload: jest.fn(() => new Response()),
        download: jest.fn(() => new Response()),
        createDir: jest.fn(() => new Response())
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.download = jest.fn(() => Promise.resolve())

      try {
        await service.init(config)
      } catch (e) {
        expect(e).toBe('network')
      }

      expect(service.download).toHaveBeenCalledTimes(0)
      expect(fetchInit.checkServer).toHaveBeenCalledTimes(1)
      expect(fetchInit.checkServer).lastCalledWith(
        ...fetchArgs.checkServer(config)
      )
      // @upstream JSDOM missing namespace selector support
      // expect(fetchInit.createDir).toHaveBeenCalledTimes(0)
      expect(fetchInit.upload).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
    })

    it('should reject with "mkcol" if cannot create dir', async () => {
      const config: SyncConfig = {
        url: 'https://example.com/dav/',
        user: 'user',
        passwd: 'passwd',
        duration: 0
      }

      const fetchInit = {
        checkServer: jest.fn(() => new Response(genXML(true))),
        upload: jest.fn(() => new Response()),
        download: jest.fn(() => new Response()),
        createDir: jest.fn(() => new Response(null, { status: 504 }))
      }

      mockFetch(config, fetchInit)

      const service = new Service()
      service.config = config
      service.download = jest.fn(() => Promise.resolve())

      try {
        await service.init(config)
      } catch (e) {
        expect(e).toBe('mkcol')
      }

      expect(service.download).toHaveBeenCalledTimes(0)
      expect(fetchInit.checkServer).toHaveBeenCalledTimes(1)
      expect(fetchInit.checkServer).lastCalledWith(
        ...fetchArgs.checkServer(config)
      )
      expect(fetchInit.createDir).toHaveBeenCalledTimes(1)
      expect(fetchInit.createDir).lastCalledWith(...fetchArgs.createDir(config))
      expect(fetchInit.upload).toHaveBeenCalledTimes(0)
      expect(fetchInit.download).toHaveBeenCalledTimes(0)
      expect(helpers.setMeta).toHaveBeenCalledTimes(0)
      expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
    })

    // @upstream JSDOM missing namespace selector support
    // it('should reject with "exist" if local has a newer file', async () => {
    //   const config: SyncConfig = {
    //     url: 'https://example.com/dav/',
    //     user: 'user',
    //     passwd: 'passwd',
    //     duration: 0,
    //   }

    //   const file: NotebookFile = {
    //     timestamp: Date.now(),
    //     words: [
    //       {
    //         ...newWord({ text: 'test' }),
    //         date: Date.now(),
    //       }
    //     ],
    //   }
    //   const fileText = JSON.stringify(file)

    //   const etagLocal = 'etag12345'
    //   const etag = 'etag222'

    //   const fetchInit = {
    //     checkServer: jest.fn(() => new Response(genXML(true))),
    //     upload: jest.fn(() => new Response()),
    //     download: jest.fn(() => new Response(
    //       fileText,
    //       {
    //         headers: {
    //           etag,
    //         }
    //       }
    //     )),
    //     createDir: jest.fn(() => new Response())
    //   }

    //   helpers.getMeta.mockImplementationOnce((): Promise<Meta> => Promise.resolve({
    //     timestamp: file.timestamp + 100,
    //     etag: etagLocal
    //   }))
    //   mockFetch(config, fetchInit)

    //   c{ onsor t} err = await initServer(config)
    //   exerrort(err).toBe('exist')
    //   expect(fetchInit.checkServer).toHaveBeenCalledTimes(1)
    //   expect(fetchInit.checkServer).lastCalledWith(...fetchArgs.checkServer(config))
    //   // @upstream JSDOM missing namespace selector support
    //   // expect(fetchInit.createDir).toHaveBeenCalledTimes(0)
    //   expect(fetchInit.upload).toHaveBeenCalledTimes(0)
    //   expect(fetchInit.download).toHaveBeenCalledTimes(0)
    //   expect(helpers.setMeta).toHaveBeenCalledTimes(0)
    //   expect(helpers.setNotebook).toHaveBeenCalledTimes(0)
    // })
  })
})

function genXML(withDir?: boolean): string {
  const dir = `<d:response>
    <d:href>/dav/Saladict/</d:href>
    <d:propstat>
      <d:prop>
        <d:getlastmodified>Mon, 31 Oct 2018 07:31:21 GMT</d:getlastmodified>
        <d:getcontentlength>0</d:getcontentlength>
        <d:owner>example@somemail.com</d:owner>
        <d:current-user-privilege-set>
          <d:privilege>
            <d:read />
          </d:privilege>
          <d:privilege>
            <d:write />
          </d:privilege>
          <d:privilege>
            <d:all />
          </d:privilege>
          <d:privilege>
            <d:read_acl />
          </d:privilege>
          <d:privilege>
            <d:write_acl />
          </d:privilege>
        </d:current-user-privilege-set>
        <d:getcontenttype>httpd/unix-directory</d:getcontenttype>
        <d:displayname>Saladict</d:displayname>
        <d:resourcetype>
          <d:collection />
        </d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>`

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <d:multistatus xmlns:d="DAV:" xmlns:s="http://ns.example.com">
    <d:response>
      <d:href>/dav/</d:href>
      <d:propstat>
        <d:prop>
          <d:getlastmodified>Mon, 31 Oct 2018 07:31:21 GMT</d:getlastmodified>
          <d:getcontentlength>0</d:getcontentlength>
          <d:owner>example@somemail.com</d:owner>
          <d:current-user-privilege-set>
            <d:privilege>
              <d:read />
            </d:privilege>
          </d:current-user-privilege-set>
          <d:getcontenttype>httpd/unix-directory</d:getcontenttype>
          <d:displayname>dav</d:displayname>
          <d:resourcetype>
            <d:collection />
          </d:resourcetype>
        </d:prop>
        <d:status>HTTP/1.1 200 OK</d:status>
      </d:propstat>
    </d:response>
    ${withDir ? dir : ''}
  </d:multistatus>`
}

function getWord(word: Partial<Word> = {}): Word {
  return {
    date: Date.now(),
    text: '',
    context: '',
    title: '',
    url: '',
    favicon: '',
    trans: '',
    note: '',
    ...word
  }
}
