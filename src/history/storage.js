import storageRecord from 'src/helpers/storage-records'

export function addRecord (...args) { return storageRecord.addRecord('history', ...args) }
export function clearRecords (...args) { return storageRecord.clearRecords('history', ...args) }
export function listenRecord (...args) { return storageRecord.listenRecord('history', ...args) }
export function getRecordSet (...args) { return storageRecord.getRecordSet('history', ...args) }
export function getAllWords (...args) { return storageRecord.getAllWords('history', ...args) }
export function getWordCount (...args) { return storageRecord.getWordCount('history', ...args) }

export default {
  addRecord,
  clearRecords,
  listenRecord,
  getRecordSet,
  getAllWords,
  getWordCount
}
