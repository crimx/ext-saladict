import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Anki Connect에 연결할 수 없습니다. Anki가 실행 중인지 확인하세요.',
    deck: 'Anki에서 덱을 찾을 수 없습니다.',
    notetype: 'Anki에서 노트 유형을 찾을 수 없습니다.',
    notetype_cloze:
      '노트 유형이 빈칸 채우기(Cloze) 유형이 아니어서 Anki가 단어 추가를 거부합니다. Anki에서 해당 노트 유형을 삭제하거나 이름을 변경한 후 다시 확인하여 새로 만들거나, Cloze 노트 유형을 사용하세요.',
    add: '단어를 Anki에 추가하지 못했습니다.'
  }
}
