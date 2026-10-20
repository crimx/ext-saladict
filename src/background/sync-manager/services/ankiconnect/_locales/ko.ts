import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'Anki Connect',
  error: {
    server: 'Anki Connect에 연결할 수 없습니다. Anki가 실행 중인지 확인하세요.',
    deck: 'Anki에서 덱을 찾을 수 없습니다.',
    notetype: 'Anki에서 노트 유형을 찾을 수 없습니다.',
    notetype_cloze:
      '이 노트 유형을 Cloze 유형으로 업그레이드해야 합니다. Anki Connect 설정에서 확인을 눌러 백업하고 이전하세요.',
    migration_unsupported:
      '자동 이전에는 새 AnkiConnect 이전 API가 필요합니다. AnkiConnect를 업데이트하고 Anki를 다시 시작하세요.',
    migration_manual:
      '사용자 정의 서식, 여러 카드, 필터 덱 또는 지원하지 않는 Cloze 내용은 자동으로 이전할 수 없습니다. 백업 후 Anki의 노트 유형 변경 기능을 사용하여 필드, 카드 매핑 및 복습 기록을 확인하세요.',
    migration_target_exists:
      '해당 Cloze 유형이 이미 있습니다. 이전 작업의 결과일 수 있으므로 Anki에서 확인한 뒤 설정에서 선택하세요. 자동 이전은 기존 유형을 덮어쓰지 않습니다.',
    migration_changed:
      'Anki 데이터나 활성 프로필이 변경되었습니다. 편집과 복습을 중지하고 다시 확인한 뒤 이전하세요.',
    migration_backup:
      '백업 성공을 확인할 수 없어 이전을 중지했습니다. Anki 프로필 폴더의 여유 공간과 쓰기 권한을 확인하세요.',
    migration_verify:
      '이전 결과를 확인할 수 없습니다. 백업을 보관하고 Anki에서 노트, 카드 및 복습 기록을 확인한 뒤 계속하세요.',
    add: '단어를 Anki에 추가하지 못했습니다.'
  },
  migration: {
    title: '기존 노트 유형을 Cloze로 업그레이드',
    action: '백업 및 이전',
    confirm:
      '“{{noteType}}”을 사용하는 노트 {{count}}개를 덱 {{decks}}개에서 이전합니다. Saladict는 복습 일정과 함께 덱을 백업하고 “{{target}}”을 만든 뒤 노트를 이전합니다. 검증 후 설정을 저장하고 새 유형으로 전환하며 기존 유형은 보관합니다.',
    backup_location:
      '백업은 Anki가 실행 중인 컴퓨터의 현재 프로필 폴더에서 collection.media 폴더 옆에 저장됩니다. AnkiWeb에는 업로드하지 않습니다. 기존 노트가 없으면 새 유형만 만들고 덱 백업은 생성하지 않습니다.',
    running:
      '백업 및 이전 중입니다. Anki를 열어 두고 프로필 변경, 노트 편집 또는 복습을 하지 마세요.',
    backups: '완료된 백업 파일:',
    failure_help:
      '기존 유형과 완료된 백업은 보관됩니다. 새 유형이 있으면 일부 작업이 완료되었을 수 있습니다. 유형을 삭제하거나 다시 이전하기 전에 Anki에서 확인하세요.',
    success: '노트 유형 이전 완료',
    success_help:
      '“{{target}}”으로 전환했습니다. 기존 카드와 복습 일정을 확인했습니다. 백업: {{paths}}',
    no_backup: '기존 유형에 노트가 없어 덱 백업을 생성하지 않았습니다.'
  }
}
