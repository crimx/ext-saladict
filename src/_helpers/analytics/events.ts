export type GAEventBase = {
  category: string
  action: string
  label?: string
  value?: string
}

type GAEventFactory<T extends GAEventBase> = T

export type GAEvent = GAEventFactory<
  | {
      category: 'Page_Translate'
      action: 'Open_Google' | 'Open_Youdao' | 'Open_Caiyun'
      label:
        | 'From_Browser_Action'
        | 'From_Context_Menus'
        | 'From_Browser_Shortcut'
    }
  | {
      category: 'PDF_Viewer'
      action: 'Open_PDF_Viewer'
      label:
        | 'From_Browser_Action'
        | 'From_Context_Menus'
        | 'From_Browser_Shortcut'
    }
>
