import React, { FC } from 'react'

export interface WordEditorPanelProps {
  containerWidth: number
  colors: React.CSSProperties
  title: React.ReactNode
  btns?: ReadonlyArray<{
    type?: 'normal' | 'primary'
    title: React.ReactNode
    onClick: () => void
  }>
  onClose: () => void
}

export const WordEditorPanel: FC<WordEditorPanelProps> = props => {
  return (
    <div className="wordEditorPanel-Background">
      <div
        className="wordEditorPanel-Container"
        style={{ width: props.containerWidth }}
      >
        <div className="wordEditorPanel" style={props.colors}>
          <header className="wordEditorPanel-Header">
            <h1 className="wordEditorPanel-Title">{props.title}</h1>
            <button
              type="button"
              className="wordEditorPanel-BtnClose"
              onClick={props.onClose}
            >
              ×
            </button>
          </header>
          <div className="wordEditorPanel-Main fancy-scrollbar">
            {props.children}
          </div>
          {props.btns && props.btns.length > 0 && (
            <footer className="wordEditorPanel-Footer">
              {props.btns.map((btn, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    btn.type
                      ? `wordEditorPanel-Btn_${btn.type}`
                      : 'wordEditorPanel-Btn'
                  }
                  onClick={btn.onClick}
                >
                  {btn.title}
                </button>
              ))}
            </footer>
          )}
        </div>
      </div>
    </div>
  )
}

export default WordEditorPanel
