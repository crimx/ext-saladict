import { locale as _locale } from '../zh-CN/wordpage'

export const locale: typeof _locale = {
  title: {
    history: 'Saladict 검색 기록',
    notebook: 'Saladict 단어장'
  },

  localonly: '로컬 전용',

  column: {
    add: '추가',
    date: '날짜',
    edit: '편집',
    note: '메모',
    source: '출처',
    trans: '번역',
    word: '단어'
  },

  delete: {
    title: '삭제',
    all: '전체 삭제',
    confirm: '. 확인하시겠습니까?',
    page: '페이지 삭제',
    selected: '선택 항목 삭제'
  },

  export: {
    title: '내보내기',
    all: '전체 내보내기',
    description: '각 레코드의 구성 방식: ',
    explain: 'ANKI 등 다른 도구로 내보내는 방법',
    gencontent: '생성된 내용',
    linebreak: {
      default: '기본 줄바꿈 유지',
      n: '줄바꿈을 \\n(으)로 대체',
      br: '줄바꿈을 <br>(으)로 대체',
      p: '줄바꿈을 <p>(으)로 대체',
      space: '줄바꿈을 공백으로 대체'
    },
    page: '페이지 내보내기',
    placeholder: '자리 표시자',
    htmlescape: {
      title: '메모의 HTML 문자 이스케이프',
      text: 'HTML 이스케이프'
    },
    selected: '선택 항목 내보내기'
  },

  filterWord: {
    chs: '중국어',
    eng: '영어',
    word: '단어',
    phrase: '구'
  },

  wordCount: {
    selected: '{{count}}개 항목 선택됨',
    selected_plural: '{{count}}개 항목 선택됨',
    total: '전체 {{count}}개 항목',
    total_plural: '전체 {{count}}개 항목'
  }
}
