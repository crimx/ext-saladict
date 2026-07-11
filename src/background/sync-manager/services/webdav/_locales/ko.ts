import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'WebDAV 단어 동기화',
  error: {
    dir: '서버의 "Saladict" 디렉터리 형식이 올바르지 않습니다.',
    download:
      '다운로드에 실패했습니다. WebDAV 서버에 연결할 수 없습니다. 브라우저 프록시를 사용 중이라면 WebDAV 서버는 우회하도록 규칙을 조정해 주세요.',
    internal: '설정을 저장할 수 없습니다.',
    missing: '서버에 "Saladict" 디렉터리가 없습니다.',
    mkcol:
      '서버에 "Saladict" 디렉터리를 생성할 수 없습니다. 서버에서 직접 디렉터리를 생성해 주세요.',
    network: '네트워크 오류입니다. 서버에 연결할 수 없습니다.',
    parse: '서버가 반환한 XML 형식이 올바르지 않습니다.',
    unauthorized: '계정 또는 비밀번호가 올바르지 않습니다.'
  }
}
