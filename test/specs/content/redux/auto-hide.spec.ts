import { AppConfigMutable, getDefaultConfig } from '@/app-config'
import { newWord } from '@/_helpers/record-manager'
import { Message } from '@/typings/message'
import { State } from '@/content/redux/modules/state'
import { newSelection } from '@/content/redux/modules/action-handlers/new-selection'
import { actionHandlers } from '@/content/redux/modules/action-handlers'

describe('normal selection auto-hide', () => {
  it('arms auto-hide when direct selection opens an unpinned panel', () => {
    const state = createState()
    state.config.mode.direct = true

    const result = newSelection((state as unknown) as State, {
      type: 'NEW_SELECTION',
      payload: state.selection
    })

    expect(result.isShowDictPanel).toBe(true)
    expect(result.autoHidePanel).toBe(true)
  })

  it('arms auto-hide when the bowl opens an unpinned panel', () => {
    const state = createState()

    const result = actionHandlers.BOWL_ACTIVATED((state as unknown) as State, {
      type: 'BOWL_ACTIVATED'
    })

    expect(result.isShowDictPanel).toBe(true)
    expect(result.autoHidePanel).toBe(true)
  })
})

function createState() {
  const config = getDefaultConfig() as AppConfigMutable
  config.mode.autoHide = true
  config.mode.instant.enable = false
  config.defaultPinned = false

  const selection: Message<'SELECTION'>['payload'] = {
    word: newWord({ text: 'selection' }),
    mouseX: 20,
    mouseY: 20,
    dbClick: false,
    altKey: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    self: false,
    instant: false,
    force: true
  }

  return {
    config,
    selection,
    isPinned: false,
    withQssaPanel: false,
    isTempDisabled: false,
    isShowDictPanel: false,
    isShowBowl: false,
    bowlCoord: { x: 0, y: 0 },
    dictPanelCoord: { x: 0, y: 0 },
    autoHidePanel: false
  }
}
