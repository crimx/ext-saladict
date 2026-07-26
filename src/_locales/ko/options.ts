import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: 'Saladict 설정',
  previewPanel: '사전 패널 미리보기',
  shortcuts: '단축키 설정',
  msg_update_error: '설정을 업데이트하지 못했습니다',
  msg_updated: '설정이 업데이트되었습니다',
  msg_first_time_notice: '처음 사용 시 안내',
  msg_err_permission: '"{{permission}}" 권한 요청에 실패했습니다.',
  unsave_confirm: '변경 사항이 저장되지 않았습니다. 그래도 닫으시겠습니까?',
  nativeSearch: '브라우저 밖에서 선택한 텍스트 검색',
  firefox_shortcuts:
    'about:addons를 열고 오른쪽 위 톱니바퀴 버튼을 클릭한 뒤, 마지막 항목인 "확장 기능 단축키 관리"를 선택하세요.',
  tutorial: '튜토리얼',
  page_selection: '페이지 선택 영역',

  nav: {
    General: '일반',
    Notebook: '단어장',
    Profiles: '프로필',
    DictPanel: '사전 패널',
    SearchModes: '검색 방식',
    Dictionaries: '사전',
    DictAuths: '액세스 토큰',
    Popup: '팝업 패널',
    QuickSearch: '빠른 검색',
    Pronunciation: '발음',
    PDF: 'PDF',
    ContextMenus: '컨텍스트 메뉴',
    BlackWhiteList: '차단/허용 목록',
    ImportExport: '가져오기/내보내기',
    Privacy: '개인정보',
    Permissions: '권한'
  },

  config: {
    active: '인라인 번역 사용',
    active_help: '인라인 번역을 꺼도 "빠른 검색"은 계속 사용할 수 있습니다.',
    animation: '전환 애니메이션',
    animation_help: '전환 애니메이션을 꺼서 실행 부담을 줄일 수 있습니다.',
    runInBg: '백그라운드에서 유지',
    runInBg_help:
      '브라우저를 닫아도 백그라운드에서 계속 실행해 전역 단축키가 계속 동작하도록 합니다.',
    darkMode: '테마 모드',
    langCode: '앱 언어',
    editOnFav: '즐겨찾기 시 단어 편집기 열기',
    editOnFav_help: '이 옵션을 끄면 새 단어가 바로 단어장에 추가됩니다.',
    searchHistory: '검색 기록 저장',
    searchHistory_help:
      '검색 기록에 브라우징 이력이 의도치 않게 드러날 수 있습니다.',
    searchHistoryInco: '시크릿 모드에서도 저장',
    ctxTrans: '문맥 번역 엔진',
    ctxTrans_help: '단어장에 추가되기 전에 문맥 문장이 먼저 번역됩니다.',
    searchSuggests: '입력 시 검색어 추천',
    panelMaxHeightRatio: '패널 최대 높이 비율',
    panelWidth: '패널 너비',
    fontSize: '검색 결과 글자 크기',
    bowlOffsetX: 'Saladict 아이콘 X축 오프셋',
    bowlOffsetY: 'Saladict 아이콘 Y축 오프셋',
    panelCSS: '사전 패널 커스텀 스타일',
    panelCSS_help:
      '커스텀 CSS입니다. 사전 패널은 .dictPanel-Root를, 개별 사전은 .dictRoot 또는 .d-{id}를 루트로 사용하세요.',
    noTypeField: '입력 가능한 영역에서 선택 비활성화',
    noTypeField_help:
      '편집 가능한 영역에서 선택을 막으면, 확장 프로그램이 입력창, 텍스트 영역, CodeMirror·ACE·Monaco 등 일반적인 텍스트 편집기를 식별해 처리합니다.',
    touchMode: '터치 모드',
    touchMode_help: '터치 기반 선택을 사용합니다.',
    language: '선택 언어',
    language_help:
      '선택 영역에 지정한 언어의 단어가 포함된 경우에만 검색합니다.',
    language_extra:
      '일본어와 한국어에는 한자도 포함됩니다. 프랑스어, 독일어, 스페인어에는 영어도 포함됩니다. 다른 언어를 선택한 상태에서 중국어나 영어를 해제하면, 해당 언어만의 고유한 부분(예: 일본어의 가나 문자)만 검사합니다.',
    doubleClickDelay: '더블클릭 간격',
    mode: '일반 선택',
    panelMode: '사전 패널 내부',
    pinMode: '패널이 고정되었을 때',
    qsPanelMode: '독립 패널이 열려 있을 때',
    bowlHover: '아이콘에 마우스 오버',
    bowlHover_help: '클릭 대신 아이콘에 마우스를 올리면 검색이 실행됩니다.',
    autopron: {
      cn: {
        dict: '중국어 자동 발음'
      },
      en: {
        dict: '영어 자동 발음',
        accent: '선호 발음'
      },
      machine: {
        dict: '기계 번역 자동 발음',
        src: '기계 번역 발음',
        src_help:
          '자동 발음을 사용하려면 아래 목록에서 기계 번역 사전을 추가하고 활성화해야 합니다.',
        src_search: '원문 읽어주기',
        src_trans: '번역문 읽어주기'
      }
    },
    pdfSniff: 'PDF 감지 사용',
    pdfSniff_help:
      '켜면 PDF 링크를 자동으로 감지합니다 (확장 프로그램 페이지에서 파일 URL 접근이 허용된 경우 로컬 파일 포함).',
    pdfSniff_extra:
      '좋아하는 로컬 리더로 {브라우저 밖에서 선택한 텍스트 검색}을 사용하는 것을 권장합니다.',
    pdfStandalone: '독립 패널',
    pdfStandalone_help: 'PDF 뷰어를 독립 패널에서 엽니다.',
    baWidth: '너비',
    baWidth_help:
      '브라우저 액션 패널의 너비입니다. 음수를 지정하면 사전 패널의 너비를 사용합니다.',
    baHeight: '높이',
    baHeight_help: '브라우저 액션 패널의 높이입니다.',
    baOpen: '브라우저 액션',
    baOpen_help:
      '툴바(주소창 옆)의 브라우저 액션 아이콘을 클릭했을 때의 동작입니다. 항목은 컨텍스트 메뉴와 동일하며, 컨텍스트 메뉴 설정 페이지에서 추가·편집할 수 있습니다.',
    tripleCtrl: 'Ctrl 단축키 사용',
    tripleCtrl_help:
      '{⌘ Command}(macOS) 또는 {Ctrl}(그 외)를 세 번(또는 브라우저 단축키와 함께) 누르면 사전 패널이 나타납니다.',
    defaultPinned: '나타날 때 고정',
    qsLocation: '위치',
    qsFocus: '나타날 때 포커스 가져오기',
    qsStandalone: '독립 실행',
    qsStandalone_help:
      '사전 패널을 독립된 창으로 표시합니다. {브라우저 밖에서 선택한 텍스트 검색}을 사용할 수 있습니다.',
    qssaSidebar: '사이드바 레이아웃',
    qssaSidebar_help: '창을 사이드바처럼 나란히 배치합니다.',
    qssaHeight: '창 높이',
    qssaPageSel: '선택 영역 반응',
    qssaPageSel_help: '페이지에서 선택한 내용에 반응합니다.',
    qssaRectMemo: '크기와 위치 기억',
    qssaRectMemo_help: '독립 패널을 닫을 때 크기와 위치를 기억합니다.',
    updateCheck: '업데이트 확인',
    updateCheck_help: '자동으로 업데이트를 확인합니다.',
    analytics: 'Google Analytics 사용',
    analytics_help:
      '익명의 기기·브라우저 버전 정보를 공유합니다. Saladict 개발자는 사용자가 많은 기기와 브라우저를 우선적으로 지원합니다.',

    opt: {
      reset: '설정 초기화',
      reset_confirm: '기본 설정으로 초기화하시겠습니까?',
      upload_error: '설정을 저장하지 못했습니다.',
      accent: {
        uk: '영국식',
        us: '미국식'
      },
      darkMode: {
        light: '라이트',
        dark: '다크',
        follow: '자동'
      },
      sel_blackwhitelist: '선택 영역 차단/허용 목록',
      sel_blackwhitelist_help:
        '차단 목록에 있는 페이지에서는 선택 영역에 반응하지 않습니다.',
      pdf_blackwhitelist_help:
        '차단 목록에 있는 PDF 링크는 Saladict PDF 뷰어로 연결되지 않습니다.',
      contextMenus_description:
        '각 컨텍스트 메뉴 항목도 커스터마이즈할 수 있습니다.',
      contextMenus_edit: '컨텍스트 메뉴 항목 편집',
      contextMenus_url_rules: '검색어가 들어갈 자리에 %s를 사용하는 URL입니다.',
      baOpen: {
        popup_panel: '사전 패널',
        popup_fav: '단어장에 추가',
        popup_options: 'Saladict 설정 열기',
        popup_standalone: 'Saladict 독립 패널 열기'
      },
      openQsStandalone: '독립 패널 설정',
      pdfStandalone: {
        default: '사용 안 함',
        always: '항상',
        manual: '수동'
      }
    }
  },

  matchPattern: {
    description:
      'URL은 {URL 일치 패턴} 또는 {정규식}으로 지정할 수 있습니다. 빈 필드는 제거됩니다.',
    url: 'URL 일치 패턴',
    url_error: 'URL 일치 패턴이 올바르지 않습니다.',
    regex: '정규식',
    regex_error: '정규식이 올바르지 않습니다.'
  },

  searchMode: {
    autoHide: '고정하지 않은 패널 자동 숨기기',
    autoHide_help:
      '포인터가 사전 패널을 벗어나면 잠시 후 패널을 숨깁니다. 패널에 다시 진입하거나 포커스가 패널 내에 있으면 숨김이 취소됩니다.',
    icon: '아이콘 표시',
    icon_help: '커서 근처에 작은 아이콘이 나타납니다.',
    direct: '바로 검색',
    direct_help: '사전 패널을 바로 표시합니다.',
    double: '더블클릭',
    double_help: '선택 영역을 더블클릭하면 사전 패널을 표시합니다.',
    holding: '키를 누른 채로',
    holding_help:
      '선택 후 마우스를 놓을 때 지정한 키를 누르고 있어야 합니다 (macOS에서 Alt는 "⌥ Option", Meta 키는 macOS에서 "⌘ Command", 그 외에서는 "⊞ Windows"입니다).',
    instant: '즉시 캡처',
    instant_help: '커서 근처의 내용이 자동으로 선택됩니다.',
    instantDirect: '바로 실행',
    instantKey: '키',
    instantKey_help:
      '"바로 실행"을 선택했다면 즉시 캡처를 켜고 끄는 브라우저 단축키도 설정하는 것을 권장합니다. 그렇지 않으면 브라우저의 텍스트 선택이 제대로 동작하지 않을 수 있습니다.',
    instantDelay: '캡처 지연 시간'
  },

  profiles: {
    opt: {
      add_name: '프로필 이름 추가',
      delete_confirm: '프로필 "{{name}}"을(를) 삭제하시겠습니까?',
      edit_name: '프로필 이름 변경',
      help:
        '각 프로필은 독립된 설정 묶음입니다. 일부 설정(앞에 {*}가 붙은 항목)은 프로필에 따라 달라집니다. 사전 패널의 메뉴 아이콘에 마우스를 올리거나, 아이콘에 포커스를 준 뒤 {↓}를 눌러 프로필을 전환할 수 있습니다.'
    }
  },

  profile: {
    mtaAutoUnfold: '여러 줄 검색창 자동으로 펼치기',
    waveform: '파형 컨트롤',
    waveform_help:
      '사전 패널 하단에 파형 컨트롤 패널을 펼치는 버튼을 표시합니다. 펼친 후에만 로드됩니다.',
    stickyFold: '펼침/접힘 기억',
    stickyFold_help:
      '검색 시 이전에 수동으로 펼치거나 접은 사전 상태를 기억합니다. 같은 페이지에서만 유지됩니다.',

    opt: {
      item_extra: '이 옵션은 "프로필"에 따라 달라질 수 있습니다.',
      mtaAutoUnfold: {
        always: '항상 펼치기',
        never: '펼치지 않음',
        once: '한 번만 펼치기',
        popup: '브라우저 액션에서만',
        hide: '숨기기'
      },
      dict_selected: '선택된 사전'
    }
  },

  dict: {
    add: '사전 추가',
    more_options: '추가 옵션',

    selectionLang: '선택 언어',
    selectionLang_help:
      '선택 영역에 지정한 언어의 단어가 포함된 경우에만 이 사전을 표시합니다.',
    defaultUnfold: '기본 펼침',
    defaultUnfold_help:
      '끄면 제목 표시줄을 클릭하기 전까지 이 사전은 검색을 시작하지 않습니다.',
    selectionWC: '선택 단어 수',
    selectionWC_help:
      '선택한 단어 수가 조건을 만족할 때만 이 사전을 표시합니다. 제한이 없으려면 999999로 설정하세요.',
    preferredHeight: '기본 패널 높이',
    preferredHeight_help:
      '처음 나타났을 때의 최대 높이입니다. 이 높이를 넘는 내용은 가려집니다. 제한이 없으려면 999999로 설정하세요.',

    lang: {
      de: '독',
      en: '영',
      es: '서',
      fr: '프',
      ja: '일',
      kor: '한',
      zhs: '간',
      zht: '번'
    }
  },

  syncService: {
    description: '동기화 설정.',
    start: '동기화 진행 중입니다. 끝날 때까지 이 페이지를 닫지 마세요.',
    finished: '동기화 완료',
    success: '동기화 성공',
    failed: '동기화 실패',
    close_confirm: '설정이 저장되지 않았습니다. 닫으시겠습니까?',
    delete_confirm: '삭제하시겠습니까?',

    shanbay: {
      description:
        '먼저 shanbay.com에 접속해 로그인 상태를 유지하세요. 이 동기화는 단방향(Saladict에서 Shanbay로)이며, 새로 추가된 단어만 동기화됩니다. 또한 Shanbay 사전 데이터베이스에서 지원하는 단어여야 합니다.',
      login:
        'shanbay.com이 열립니다. 로그인한 뒤 돌아와서 다시 활성화해 주세요.',
      sync_all: '기존 단어 전체 업로드',
      sync_all_confirm:
        '단어장에 단어가 너무 많아 Saladict가 여러 번에 나눠 업로드합니다. 짧은 시간에 너무 많은 단어를 업로드하면 계정이 정지될 수 있으며 이는 되돌릴 수 없습니다. 계속하시겠습니까?',
      sync_last: '가장 최근 단어 업로드'
    },

    eudic: {
      description:
        '이유(Eudic)로 단어를 동기화하려면 먼저 이유 공식 웹사이트(my.eudic.net/home/index)에서 기본 새 단어장을 만들어야 합니다 (보통 처음 수동으로 가져오면 자동으로 생성되며 이후 삭제할 수 없습니다). 짧은 시간에 너무 자주 동기화하면 일시적으로 잠길 수 있으니 주의하세요.',
      token: '인증 정보',
      getToken: '인증 받기',
      verify: '인증 정보 확인',
      verified: '이유 인증 정보를 확인했습니다',
      enable_help:
        '켜면 새로 추가되는 단어가 자동으로 (Saladict에서 이유 기본 단어장으로) 단방향 동기화되며, 새로 추가된 단어 자체만 동기화됩니다 (삭제는 동기화되지 않습니다).',
      token_help:
        '유효한 개인 인증 정보를 설정했는지 확인하세요. 그렇지 않으면 동기화가 실패합니다. 아래 버튼으로 확인할 수 있습니다.',
      sync_all: '전체 단어 동기화',
      sync_help:
        'Saladict 단어장에 있는 모든 기존 단어를 이유 기본 단어장으로 동기화합니다 (위의 동기화 스위치를 함께 켜고 저장을 눌러야 합니다).',
      sync_all_confirm:
        '짧은 시간에 너무 자주 동기화하면 일시적으로 잠길 수 있습니다. 계속하시겠습니까?'
    },

    webdav: {
      description:
        '확장 프로그램 설정(이 항목 포함)은 브라우저를 통해 동기화됩니다. 새 단어장은 여기 설정을 통해 WebDAV로 동기화할 수 있습니다.',
      jianguo: '지엔궈윈(Jianguoyun) 설정 예시 참고',
      checking: '연결 중...',
      exist_confirm:
        '서버에 Saladict 디렉터리가 이미 있습니다. 다운로드해 로컬 데이터와 병합할까요?',
      upload_confirm: '지금 바로 로컬 데이터를 서버에 업로드할까요?',
      verify: '서버 확인',
      verified: 'WebDAV 서버를 확인했습니다.',
      duration: '동기화 주기',
      duration_help:
        '업로드 전에 데이터가 최신 상태인지 항상 확인합니다. 브라우저 간 실시간 동기화가 필요 없다면 주기를 길게 설정해 CPU와 메모리 사용을 줄일 수 있습니다.',
      passwd: '비밀번호',
      url: '서버 주소',
      user: '계정'
    },

    ankiconnect: {
      description:
        'Anki Connect 플러그인이 설치되어 있고 Anki가 실행 중인지 확인하세요. 단어 편집기에서도 단어를 Anki로 업데이트할 수 있습니다.',
      checking: '확인 중...',
      deck_confirm: 'Anki에 "{{deck}}" 덱이 없습니다. 새 덱을 만들까요?',
      deck_error: '덱 "{{deck}}"을(를) 만들지 못했습니다.',
      notetype_confirm:
        'Anki에 노트 유형 "{{noteType}}"이(가) 없습니다. 새 노트 유형을 만듭니다.',
      notetype_error: '노트 유형 "{{noteType}}"을(를) 만들지 못했습니다.',
      upload_confirm:
        '지금 바로 로컬 새 단어를 Anki에 동기화할까요? 동일한 타임스탬프를 가진 중복 단어는 건너뜁니다.',
      add_yourself: 'Anki에서 직접 추가해 주세요.',
      verify: 'Anki Connect 확인',
      verified: 'Anki Connect를 확인했습니다.',
      enable_help:
        '켜면 단어장에 새 단어가 추가될 때마다 자동으로 Anki에도 전달됩니다. Anki에 이미 있는 단어("Date"가 같은 경우)는 단어 편집기에서 강제로 업데이트할 수 있습니다.',
      host: '주소',
      port: '포트',
      key: '키',
      key_help:
        '식별을 위해 Anki Connect 설정에 선택적으로 키를 추가할 수 있습니다.',
      deckName: '덱',
      deckName_help:
        '덱이 없다면 아래 "Anki Connect 확인" 버튼을 클릭해 기본 덱을 자동으로 생성할 수 있습니다.',
      noteType: '노트 유형',
      noteType_help:
        'Anki 노트 유형은 필드 집합과 카드 유형으로 구성됩니다. 없다면 아래 "Anki Connect 확인" 버튼을 클릭해 기본 노트 유형을 자동으로 생성할 수 있습니다. Anki에서 카드 템플릿을 편집하거나 추가할 때 필드 이름은 변경하지 마세요.',
      tags: '태그',
      tags_help: 'Anki 노트에는 쉼표로 구분한 태그를 포함할 수 있습니다.',
      escapeHTML: 'HTML 이스케이프',
      escapeHTML_help:
        '노트의 HTML 문자를 이스케이프합니다. 수동으로 HTML 레이아웃을 사용한다면 꺼 주세요.',
      syncServer: '서버와 동기화',
      syncServer_help:
        '새 단어가 로컬 Anki에 추가된 후 서버(예: AnkiWeb)와 동기화합니다.'
    }
  },

  titlebarOffset: {
    title: '제목 표시줄 높이 보정',
    help:
      '시스템이나 브라우저 설정에 따라 제목 표시줄 높이가 다를 수 있습니다. Saladict가 자동으로 보정을 시도하며, 필요하면 직접 조정할 수 있습니다.',
    main: '일반',
    main_help: '일반 창에는 제목 표시줄이 없을 수 있습니다.',
    panel: '패널',
    panel_help: 'Saladict 독립 실행 빠른 검색 패널은 패널 유형의 창입니다.',
    calibrate: '자동 보정',
    calibrateSuccess: '보정 성공',
    calibrateError: '보정 실패'
  },

  headInfo: {
    acknowledgement: {
      title: '감사의 말',
      yipanhuasheng:
        "Merriam-Webster 사전, American Heritage 사전, Oxford Learner's 사전, 이유(Eudic) 단어장 동기화 기능 추가, Urban 사전 및 Naver 사전 업데이트에 감사드립니다",
      naver: 'Naver 사전 추가를 도와주신 것에 감사드립니다',
      shanbay: 'Shanbay 사전 추가에 감사드립니다',
      trans_tw: '번체 중국어 번역에 감사드립니다',
      weblio: 'Weblio 사전 추가를 도와주신 것에 감사드립니다',
      machine_translators:
        '알리바바 번역, 니우트랜스(Niutrans), 볼케이노(Volcengine) 번역 구현에 감사드립니다',
      bingtrans: 'Bing 번역 구현에 감사드립니다',
      trans_ko: '한국어 번역에 감사드립니다'
    },
    contact_author: '개발자에게 연락하기',
    donate: '후원하기',
    instructions: '사용 설명서',
    report_issue: '문제 신고'
  },

  form: {
    url_error: 'URL이 올바르지 않습니다.',
    number_error: '숫자가 올바르지 않습니다.'
  },

  preload: {
    title: '미리 불러오기',
    auto: '자동 검색',
    auto_help: '패널이 나타날 때 자동으로 검색합니다.',
    clipboard: '클립보드',
    help: '패널이 나타날 때 검색창에 내용을 미리 채워 넣습니다.',
    selection: '페이지 선택 영역'
  },

  locations: {
    CENTER: '가운데',
    TOP: '위',
    RIGHT: '오른쪽',
    BOTTOM: '아래',
    LEFT: '왼쪽',
    TOP_LEFT: '왼쪽 위',
    TOP_RIGHT: '오른쪽 위',
    BOTTOM_LEFT: '왼쪽 아래',
    BOTTOM_RIGHT: '오른쪽 아래'
  },

  import_export_help:
    '설정은 브라우저를 통해 자동으로 동기화됩니다. 여기서 수동으로 가져오거나 내보낼 수도 있습니다. 백업은 일반 텍스트 파일로 내보내지므로, 필요하다면 직접 암호화해 주세요.',

  import: {
    title: '설정 가져오기',
    error: {
      title: '가져오기 오류',
      parse: '백업을 해석할 수 없습니다. 형식이 올바르지 않습니다.',
      load:
        '백업을 불러올 수 없습니다. 브라우저가 로컬 파일에 접근하지 못했습니다.',
      empty: '백업에서 유효한 데이터를 찾지 못했습니다.'
    }
  },

  export: {
    title: '설정 내보내기',
    error: {
      title: '내보내기 오류',
      empty: '내보낼 설정이 없습니다.',
      parse: '설정을 해석할 수 없습니다.'
    }
  },

  dictAuth: {
    description:
      'Saladict 사용자가 늘어남에 따라, 기계 번역 서비스를 자주 사용한다면 더 안정적이고 정확한 이용을 위해 계정을 등록하는 것을 권장합니다. 계정 데이터는 브라우저에만 저장됩니다.',
    dictHelp: '{dict} 공식 웹사이트를 참고하세요.',
    manage: '번역 계정 관리'
  },

  third_party_privacy: '제3자 개인정보',
  third_party_privacy_help:
    'Saladict는 그 이상의 정보를 수집하지 않지만, 검색어와 관련 쿠키는 (해당 사이트에서 직접 검색할 때와 마찬가지로) 제3자 사전 서비스로 전송됩니다. 제3자 서비스가 데이터를 수집하는 것을 원하지 않는다면 "사전" 설정에서 해당 사전을 제거하세요.',
  third_party_privacy_extra: 'Saladict의 핵심 기능이므로 끌 수 없습니다.',

  permissions: {
    success: '권한 요청 성공',
    cancel_success: '권한 취소 성공',
    failed: '권한 요청 실패',
    cancelled: '사용자가 권한 요청을 취소했습니다',
    missing:
      '"{{permission}}" 권한이 없습니다. 권한을 허용하거나 관련 기능을 꺼 주세요.',
    clipboardRead: '클립보드 읽기',
    clipboardRead_help:
      '팝업 패널이나 빠른 검색 패널에서 클립보드 미리 불러오기를 사용할 때 이 권한이 필요합니다.',
    clipboardWrite: '클립보드 쓰기',
    clipboardWrite_help:
      '제목 표시줄 메뉴에서 기계 번역의 원문/번역문을 복사할 때 이 권한이 필요합니다.'
  },

  unsupportedFeatures: {
    ff: 'Firefox에서는 "{{feature}}" 기능을 지원하지 않습니다.'
  }
}
