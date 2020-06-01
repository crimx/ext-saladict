import { EMPTY, Observable } from 'rxjs'

const emptyPromise = (): Promise<any> => Promise.resolve()

export const setSyncConfig = jest.fn(emptyPromise)

export const getSyncConfig = jest.fn(emptyPromise)

export const createSyncConfigStream = jest.fn((): Observable<any> => EMPTY)

export const setMeta = jest.fn(emptyPromise)

export const getMeta = jest.fn(emptyPromise)

export const deleteMeta = jest.fn(emptyPromise)

export const setNotebook = jest.fn(emptyPromise)

export const getNotebook = jest.fn(emptyPromise)
