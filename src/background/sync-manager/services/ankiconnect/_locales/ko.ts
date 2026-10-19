import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Anki Connect에 연결할 수 없습니다. Anki가 실행 중인지 확인하세요.',
    deck: 'Anki에서 덱을 찾을 수 없습니다.',
    notetype: 'Anki에서 노트 유형을 찾을 수 없습니다.',
    notetype_cloze:
      '이 노트 유형은 빈칸 채우기(Cloze) 유형이 아니므로 단어를 추가할 수 없습니다. Anki 데이터를 백업한 뒤 Saladict에 필요한 필드와 서식이 있는 Cloze 노트 유형을 만들고, Anki 탐색기의 노트 유형 변경 기능으로 기존 노트를 옮기세요. 필드와 카드 매핑 및 복습 기록을 확인하세요. 기존 유형의 이름을 바꾸고 다시 확인하면 새 유형만 생성되며 기존 노트는 옮겨지지 않습니다. 노트가 남아 있는 유형을 삭제하면 노트와 복습 기록도 삭제되므로 삭제하지 마세요.',
    add: '단어를 Anki에 추가하지 못했습니다.'
  }
}
