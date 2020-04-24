import { useIsShowDictPanel } from './panel-store'

export const formItemFooterLayout = {
  wrapperCol: { offset: 6, span: 18 }
} as const

export const formItemModalLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
} as const

const formItemLayoutWithDictPanel = {
  labelCol: {
    xs: { span: 9 },
    sm: { span: 9 },
    lg: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 15 },
    sm: { span: 15 },
    lg: { span: 8 }
  }
} as const

const formItemLayoutWithoutDictPanel = {
  labelCol: {
    xs: { span: 9 },
    sm: { span: 9 },
    lg: { span: 7 }
  },
  wrapperCol: {
    xs: { span: 15 },
    sm: { span: 15 },
    lg: { span: 9 }
  }
} as const

export const useFormItemLayout = () =>
  useIsShowDictPanel()
    ? formItemLayoutWithDictPanel
    : formItemLayoutWithoutDictPanel

const listLayoutWithPanel = {
  xs: { span: 24 },
  sm: { span: 24 },
  lg: { span: 12 }
} as const

const listLayoutWithoutPanel = {
  xs: { span: 24 },
  sm: { span: 24 },
  lg: { span: 14, offset: 2 }
} as const

export const useListLayout = () =>
  useIsShowDictPanel() ? listLayoutWithPanel : listLayoutWithoutPanel
