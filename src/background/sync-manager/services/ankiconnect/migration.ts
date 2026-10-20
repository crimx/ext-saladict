import isEqual from 'lodash/isEqual'
import { Service, cardText } from './index'

interface NoteType {
  id: string
  name: string
  kind: string
  fields: Array<{ name: string; [key: string]: any }>
  templates: Array<{
    name: string
    questionHtml: string
    answerHtml: string
    [key: string]: any
  }>
  css: string
  sortField: string
  latexHeader: string
  latexFooter: string
  latexSvg: boolean
}

interface Note {
  id: string
  noteType: { id: string }
  fields: { [name: string]: string }
  tags: string[]
  cardIds: string[]
}

interface Card {
  id: string
  noteId: string
  deck: { id: string; name: string }
  homeDeck: unknown
  templateIndex: number
  scheduling: unknown
  flags: number
}

export interface ClozeMigrationPlan {
  session: string
  source: NoteType
  targetName: string
  notes: Note[]
  cards: Card[]
  reviews: unknown[]
  decks: Array<{ id: string; name: string }>
}

export class ClozeMigrationError extends Error {
  constructor(
    message: string,
    readonly backupPaths: string[],
    readonly targetName: string
  ) {
    super(message)
  }
}

const methods = [
  'collection.get',
  'noteTypes.get',
  'noteTypes.list',
  'noteTypes.create',
  'notes.search',
  'notes.getMany',
  'cards.getMany',
  'reviews.list',
  'notes.validateMany',
  'notes.planConversion',
  'notes.convert',
  'media.getDirectory',
  'packages.export',
  'operations.get'
]

async function many<R>(
  service: Service,
  method: string,
  ids: string[],
  session: string
): Promise<R[]> {
  const values: R[] = []
  for (let start = 0; start < ids.length; start += 100) {
    const { items } = await service.requestV1<{
      items: Array<{ result?: R; error?: unknown }>
    }>(method, { ids: ids.slice(start, start + 100), session })
    if (items.length !== Math.min(100, ids.length - start)) {
      throw new Error('migration_changed')
    }
    for (const item of items) {
      if (!item.result || item.error) throw new Error('migration_changed')
      values.push(item.result)
    }
  }
  return values
}

async function pages<R>(
  service: Service,
  method: string,
  params: object,
  key: 'ids' | 'items'
): Promise<R[]> {
  const values: R[] = []
  let cursor: string | null = null
  do {
    const page: any = await service.requestV1(method, {
      ...params,
      limit: 1000,
      ...(cursor ? { cursor } : {})
    })
    values.push(...page[key])
    cursor = page.nextCursor
  } while (cursor)
  return values
}

function definition(type: NoteType) {
  return {
    fields: type.fields,
    templates: type.templates,
    css: type.css,
    sortField: type.sortField,
    latexHeader: type.latexHeader,
    latexFooter: type.latexFooter,
    latexSvg: type.latexSvg
  }
}

function noteState(note: Note) {
  return {
    id: note.id,
    fields: note.fields,
    tags: note.tags,
    cardIds: note.cardIds
  }
}

function cardState(card: Card) {
  return {
    id: card.id,
    noteId: card.noteId,
    deck: card.deck,
    homeDeck: card.homeDeck,
    templateIndex: card.templateIndex,
    scheduling: card.scheduling,
    flags: card.flags
  }
}

export async function prepareClozeMigration(
  service: Service
): Promise<ClozeMigrationPlan> {
  let available: Array<{ name: string; available: boolean }>
  try {
    available = (
      await service.requestV1<{ methods: typeof available }>('api.describe')
    ).methods
  } catch (error) {
    if (error.type === 'methodNotFound' || error.response?.status === 404) {
      throw new Error('migration_unsupported')
    }
    throw error
  }
  if (
    !Array.isArray(available) ||
    !methods.every(name => available.some(m => m.name === name && m.available))
  ) {
    throw new Error('migration_unsupported')
  }
  const { session } = await service.requestV1<{ session: string }>(
    'collection.get'
  )
  const source = await service.requestV1<NoteType>('noteTypes.get', {
    noteType: { name: service.config.noteType },
    session
  })
  const fields = await service.getNotefields()
  if (
    source.kind !== 'normal' ||
    !isEqual(
      source.fields.map(field => field.name),
      fields
    ) ||
    source.templates.length !== 1 ||
    source.templates[0].name !== 'Saladict Cloze' ||
    source.templates[0].questionHtml.trim() !== cardText(true, fields).trim() ||
    source.templates[0].answerHtml.trim() !== cardText(false, fields).trim() ||
    source.templates[0].deck != null
  ) {
    throw new Error('migration_manual')
  }
  const targetName = `${source.name} (Cloze)`
  const types = await service.requestV1<Array<{ name: string }>>(
    'noteTypes.list',
    { session }
  )
  // A previous interrupted migration may already have moved notes into this type.
  // Never silently reuse it or create another target and lose that association.
  if (types.some(type => type.name === targetName)) {
    throw new Error('migration_target_exists')
  }
  const ids = await pages<string>(
    service,
    'notes.search',
    {
      query: `mid:${source.id}`,
      session
    },
    'ids'
  )
  const notes = await many<Note>(service, 'notes.getMany', ids, session)
  if (
    notes.some(note => {
      const clozes = [...note.fields[fields[4]].matchAll(/{{c(\d+)::/g)]
      return (
        note.noteType.id !== source.id ||
        note.cardIds.length !== 1 ||
        !clozes.length ||
        clozes.some(match => match[1] !== '1')
      )
    })
  ) {
    throw new Error('migration_manual')
  }
  const cards = await many<Card>(
    service,
    'cards.getMany',
    notes.map(note => note.cardIds[0]),
    session
  )
  if (cards.some(card => card.templateIndex !== 0 || card.homeDeck != null)) {
    throw new Error('migration_manual')
  }
  const decks = [
    ...new Map(cards.map(card => [card.deck.id, card.deck])).values()
  ]
  const reviews: unknown[] = []
  for (let start = 0; start < cards.length; start += 100) {
    reviews.push(
      ...(await pages(
        service,
        'reviews.list',
        {
          cardIds: cards.slice(start, start + 100).map(card => card.id),
          session
        },
        'items'
      ))
    )
  }
  return { session, source, targetName, notes, cards, reviews, decks }
}

export async function migrateCloze(
  service: Service,
  plan: ClozeMigrationPlan,
  onBackup: (paths: string[]) => void = () => {}
): Promise<{ noteType: string; backupPaths: string[] }> {
  const backupPaths: string[] = []
  try {
    const latest = await prepareClozeMigration(service)
    if (!isEqual(latest, plan)) throw new Error('migration_changed')
    const { session, source, targetName, notes, cards, decks } = plan
    const { path } = await service.requestV1<{ path: string }>(
      'media.getDirectory',
      { session }
    )
    if (!/[/\\]collection\.media[/\\]?$/.test(path))
      throw new Error('migration_backup')
    const directory = path.replace(/[/\\]collection\.media[/\\]?$/, '')
    const suffix = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
    // Back up every affected deck, including scheduling, before creating or converting anything.
    for (const deck of decks) {
      const backupPath = `${directory}/saladict-backup-${suffix}-${deck.id}.apkg`
      const handle = await service.requestV1<{ operationId: string }>(
        'packages.export',
        {
          deck: { id: deck.id },
          path: backupPath,
          includeScheduling: true,
          session
        }
      )
      let completed = false
      for (let attempt = 0; attempt < 2400; attempt++) {
        const operation = await service.requestV1<any>('operations.get', {
          operationId: handle.operationId
        })
        if (operation.state === 'succeeded') {
          if (
            typeof operation.result?.path !== 'string' ||
            operation.result.path.replace(/\\/g, '/') !==
              backupPath.replace(/\\/g, '/')
          )
            throw new Error('migration_backup')
          backupPaths.push(operation.result.path)
          onBackup([...backupPaths])
          completed = true
          break
        }
        if (operation.state === 'failed' || operation.state === 'cancelled') {
          throw new Error('migration_backup')
        }
        await new Promise(resolve => setTimeout(resolve, 250))
      }
      if (!completed) throw new Error('migration_backup')
    }
    // Export can take time. Reject edits, reviews or profile changes made during the backup.
    if (!isEqual(await prepareClozeMigration(service), plan)) {
      throw new Error('migration_changed')
    }
    const target = await service.requestV1<NoteType>('noteTypes.create', {
      name: targetName,
      kind: 'cloze',
      ...definition(source),
      session
    })
    for (let start = 0; start < notes.length; start += 100) {
      const batch = notes.slice(start, start + 100)
      const { items } = await service.requestV1<any>('notes.validateMany', {
        notes: batch.map(note => ({
          noteType: { id: target.id },
          deck: { id: cards.find(card => card.noteId === note.id)!.deck.id },
          fields: note.fields,
          tags: note.tags,
          duplicates: { allow: true },
          rejectEmptyQuestions: false
        })),
        session
      })
      if (
        items.length !== batch.length ||
        items.some(item => !item.result?.valid || item.error)
      ) {
        throw new Error('migration_manual')
      }
    }
    if (notes.length) {
      const mapping = await service.requestV1<any>('notes.planConversion', {
        source: { id: source.id },
        target: { id: target.id },
        session
      })
      // Native conversion from normal to Cloze requires an empty template map.
      const fields = source.fields.map(field => ({
        target: field.name,
        source: field.name
      }))
      const converted = await service.requestV1<{ changedCount: number }>(
        'notes.convert',
        {
          ids: notes.map(note => note.id),
          target: { id: target.id },
          fields,
          templates: [],
          planToken: mapping.token,
          session
        }
      )
      if (converted.changedCount !== notes.length)
        throw new Error('migration_verify')
    }
    const after = await many<Note>(
      service,
      'notes.getMany',
      notes.map(note => note.id),
      session
    )
    const afterCards = await many<Card>(
      service,
      'cards.getMany',
      cards.map(card => card.id),
      session
    )
    const afterReviews: unknown[] = []
    for (let start = 0; start < cards.length; start += 100) {
      afterReviews.push(
        ...(await pages(
          service,
          'reviews.list',
          {
            cardIds: cards.slice(start, start + 100).map(card => card.id),
            session
          },
          'items'
        ))
      )
    }
    const remaining = await pages<string>(
      service,
      'notes.search',
      {
        query: `mid:${source.id}`,
        session
      },
      'ids'
    )
    const checkedTarget = await service.requestV1<NoteType>('noteTypes.get', {
      noteType: { id: target.id },
      session
    })
    if (
      remaining.length > 0 ||
      checkedTarget.kind !== 'cloze' ||
      !isEqual(definition(checkedTarget), definition(source)) ||
      after.some(note => note.noteType.id !== target.id) ||
      !isEqual(after.map(noteState), notes.map(noteState)) ||
      !isEqual(afterCards.map(cardState), cards.map(cardState)) ||
      !isEqual(afterReviews, plan.reviews)
    ) {
      throw new Error('migration_verify')
    }
    // Retain the old model and backup files. Only the caller switches its saved configuration.
    return { noteType: target.name, backupPaths }
  } catch (error) {
    throw new ClozeMigrationError(error.message, backupPaths, plan.targetName)
  }
}
