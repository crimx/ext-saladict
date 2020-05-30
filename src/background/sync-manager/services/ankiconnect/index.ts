import axios from 'axios'
import { Word } from '@/_helpers/record-manager'
import { parseCtxText } from '@/_helpers/translateCtx'
import { AddConfig, SyncService } from '../../interface'
import { getNotebook, setSyncConfig } from '../../helpers'
import { message } from '@/_helpers/browser-api'
import { Message } from '@/typings/message'

export interface SyncConfig {
  enable: boolean
  key: string | null
  host: string
  port: string
  deckName: string
  noteType: string
  /** Note tags */
  tags: string
  escapeContext: boolean
  escapeTrans: boolean
  escapeNote: boolean
}

interface NoteFields {
  Date: string
  Text: string
  Context: string
  ContextCloze: string
  Title: string
  Url: string
  Favicon: string
  Translation: string
  Note: string
  Audio: string
}

export class Service extends SyncService<SyncConfig> {
  static readonly id = 'ankiconnect'

  static getDefaultConfig(): SyncConfig {
    return {
      enable: false,
      host: '127.0.0.1',
      port: '8765',
      key: null,
      deckName: 'Saladict',
      noteType: 'Saladict Word',
      tags: '',
      escapeContext: true,
      escapeTrans: true,
      escapeNote: true
    }
  }

  async init() {
    if (!(await this.isServerUp())) {
      throw new Error('server')
    }

    const decks = await this.request<string[]>('deckNames')
    if (!decks?.includes(this.config.deckName)) {
      throw new Error('deck')
    }

    const noteTypes = await this.request<string[]>('modelNames')
    if (!noteTypes?.includes(this.config.noteType)) {
      throw new Error('notetype')
    }
  }

  handleMessage = (msg: Message) => {
    switch (msg.type) {
      case 'ANKI_CONNECT_FIND_WORD':
        return this.findNote(msg.payload).catch(() => '')
      case 'ANKI_CONNECT_UPDATE_WORD':
        return this.updateWord(msg.payload.cardId, msg.payload.word).catch(e =>
          Promise.reject(e)
        )
    }
  }

  onStart() {
    message.addListener(this.handleMessage)
  }

  async destroy() {
    message.removeListener(this.handleMessage)
  }

  async findNote(date: number): Promise<number | undefined> {
    try {
      const notes = await this.request<number[]>('findNotes', {
        query: `deck:${this.config.deckName} Date:${date}`
      })
      return notes[0]
    } catch (e) {
      if (process.env.DEBUG) {
        console.error(e)
      }
    }
  }

  async add({ words, force }: AddConfig) {
    if (!(await this.isServerUp())) {
      throw new Error('server')
    }

    if (force) {
      words = await getNotebook()
    }

    if (!words || words.length <= 0) {
      return
    }

    await Promise.all(
      words.map(async word => {
        if (!(await this.findNote(word.date))) {
          try {
            await this.addWord(word)
          } catch (e) {
            if (process.env.DEBUG) {
              console.warn(e)
            }
            throw new Error('add')
          }
        }
      })
    )
  }

  async addWord(word: Readonly<Word>) {
    return this.request<number | null>('addNote', {
      note: {
        deckName: this.config.deckName,
        modelName: this.config.noteType,
        options: {
          allowDuplicate: false,
          duplicateScope: 'deck'
        },
        tags: this.extractTags(),
        fields: this.wordToFields(word)
      }
    })
  }

  async updateWord(noteId: number, word: Readonly<Word>) {
    return this.request('updateNoteFields', {
      note: {
        id: noteId,
        fields: this.wordToFields(word)
      }
    })
  }

  async addDeck() {
    return this.request('createDeck', { deck: this.config.deckName })
  }

  async addNoteType() {
    return this.request('createModel', {
      modelName: this.config.noteType,
      inOrderFields: [
        'Date',
        'Text',
        'Translation',
        'Context',
        'ContextCloze',
        'Note',
        'Title',
        'Url',
        'Favicon',
        'Audio'
      ] as Array<keyof NoteFields>,
      css: cardCss(),
      cardTemplates: [
        {
          Name: 'Saladict Cloze',
          Front: cardText(true),
          Back: cardText(false)
        }
      ]
    })
  }

  async request<R = void>(action: string, params?: any): Promise<R> {
    // Very puzzling. It seems axios auto-extracts the result field from response.
    const { data } = await axios({
      method: 'post',
      url: `http://${this.config.host}:${this.config.port}`,
      data: {
        key: this.config.key || null,
        action,
        params: params || {}
      }
    })

    if (process.env.DEBUG) {
      console.log(`Anki Connect ${action} response`, data)
    }

    return data
  }

  wordToFields(word: Readonly<Word>): NoteFields {
    return {
      Date: `${word.date}`,
      Text: word.text || '',
      Translation: this.parseTrans(word.trans, this.config.escapeTrans),
      Context: this.multiline(word.context, this.config.escapeContext),
      ContextCloze: this.multiline(
        word.context.split(word.text).join(`{{c1::${word.text}}}`),
        this.config.escapeContext
      ),
      Note: this.multiline(word.note, this.config.escapeNote),
      Title: word.title || '',
      Url: word.url || '',
      Favicon: word.favicon || '',
      Audio: '' // @TODO
    }
  }

  multiline(text: string, escape: boolean): string {
    text = text.trim()
    if (!text) return ''
    if (escape) {
      text = this.escapeHTML(text)
    }
    return text.trim().replace(/\n/g, '<br/>')
  }

  parseTrans(text: string, escape: boolean): string {
    text = text.trim()
    if (!text) return ''
    const ctx = parseCtxText(text)
    const ids = Object.keys(ctx)
    if (ids.length <= 0) {
      return this.multiline(text, escape)
    }

    const trans = ids
      .map(
        id =>
          `<span class="trans_title">${id}</span><div class="trans_content">${ctx[id]}</div>`
      )
      .join('')
    return text
      .split(/\[:: \w+ ::\](?:[\s\S]+?)(?:-{15})/)
      .map(text => this.multiline(text, escape))
      .join(`<div class="trans">${trans}</div>`)
  }

  private _div: HTMLElement | undefined
  escapeHTML(text: string): string {
    if (!this._div) {
      this._div = document.createElement('div')
      this._div.appendChild(document.createTextNode(''))
    }
    this._div.firstChild!.nodeValue = text
    return this._div.innerHTML
  }

  extractTags(): string[] {
    return this.config.tags
      .split(/,|，/)
      .map(t => t.trim())
      .filter(Boolean)
  }

  async isServerUp(): Promise<boolean> {
    try {
      return (await this.request<number>('version')) != null
    } catch (e) {
      if (process.env.DEBUG) {
        console.error(e)
      }
      return false
    }
  }
}

function cardText(front: boolean) {
  return `{{#ContextCloze}}
<section>{{cloze:ContextCloze}}</section>
{{#Translation}}
<section>{{Translation}}</section>
{{/Translation}}
{{/ContextCloze}}

{{^ContextCloze}}
<h1>{{Text}}</h1>
{{#Translation}}
<section>{{Translation}}</section>
{{/Translation}}
{{/ContextCloze}}

{{#Note}}
<section>{{${front ? 'hint:Note' : 'Note'}}}</section>
{{/Note}}

{{#Title}}
<section class="tsource">
<hr />
{{#Favicon}}<img src="{{Favicon}}" />{{/Favicon}} <a href="{{Url}}">{{Title}}</a>
</section>
{{/Title}}
`
}

function cardCss() {
  return `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: #333;
  background-color: white;
}

a {
  color: #5caf9e;
}

section {
  margin: 1em 0;
}

.trans {
  border: 1px solid #eee;
  padding: 0.5em;
}

.trans_title {
  display: block;
  font-size: 0.9em;
  font-weight: bold;
}

.trans_content {
  margin-bottom: 0.5em;
}

.cloze {
  font-weight: bold;
  color: #f9690e;
}

.tsource {
  position: relative;
  font-size: .8em;
}

.tsource img {
  height: .7em;
}

.tsource a {
  text-decoration: none;
}
`
}
