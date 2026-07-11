import { locale as _locale } from '../zh-CN/content'

export const locale: typeof _locale = {
  chooseLang: '다른 언어 선택',
  standalone: 'Saladict 독립 실행 패널',
  fetchLangList: '전체 언어 목록 가져오기',
  transContext: '문맥 다시 번역',
  neverShow: '다시 표시 안 함',
  fromSaladict: 'Saladict 패널에서 전달됨',
  tip: {
    historyBack: '이전 검색 기록',
    historyNext: '다음 검색 기록',
    searchText: '텍스트 검색',
    openOptions: '설정 열기',
    addToNotebook: '단어장에 추가 (마우스 오른쪽 클릭으로 단어장 열기)',
    openNotebook: '단어장 열기',
    openHistory: '기록 열기',
    shareImg: '이미지로 공유',
    pinPanel: '패널 고정',
    closePanel: '패널 닫기',
    sidebar: '사이드바 모드로 전환 (마우스 오른쪽 클릭 시 오른쪽에 고정)',
    focusPanel: '검색 시 패널이 포커스를 가져옴',
    unfocusPanel: '검색 시 패널이 포커스를 가져오지 않음'
  },
  wordEditor: {
    title: '단어장에 추가',
    wordCardsTitle: '단어장의 다른 검색 결과',
    deleteConfirm: '단어장에서 삭제하시겠습니까?',
    closeConfirm: '변경 사항이 저장되지 않습니다. 그래도 닫으시겠습니까?',
    chooseCtxTitle: '번역된 결과 선택',
    ctxHelp:
      'Saladict가 번역문 선택과 Anki 표 생성을 자동으로 처리하게 하려면 [:: xxx ::] 및 --------------- 형식을 그대로 유지하세요.'
  },
  machineTrans: {
    switch: '언어 전환',
    sl: '원문 언어',
    tl: '번역 언어',
    auto: '언어 자동 감지',
    stext: '원문',
    showSl: '원문 표시',
    copySrc: '원문 복사',
    copyTrans: '번역문 복사',
    credential: {
      missing: '{access token}을(를) 입력해 주세요.',
      invalid:
        '액세스 토큰이 유효하지 않습니다. {access token}을(를) 확인하세요.',
      quota:
        '액세스 토큰의 할당량을 초과했습니다. {access token}을(를) 확인하세요.'
    },
    login: '{access token}을(를) 입력해 주세요.',
    dictAccount: '액세스 토큰'
  },
  manualVerification: {
    title: '수동 인증이 필요합니다',
    message:
      '원본 사전 페이지를 열어 사람인지 확인하는 절차를 완료한 후, Saladict에서 다시 검색해 주세요.',
    openPage: '사전 페이지 열기'
  },
  updateAnki: {
    title: 'Anki로 업데이트',
    success: 'Anki로 단어를 성공적으로 업데이트했습니다.',
    failed: 'Anki로 단어를 업데이트하지 못했습니다.'
  }
}
