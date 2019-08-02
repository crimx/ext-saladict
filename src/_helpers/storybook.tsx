import React, { FC, useState, useEffect } from 'react'
import root from 'react-shadow'
import i18next from 'i18next'
import { number, boolean, text } from '@storybook/addon-knobs'
import SinonChrome from 'sinon-chrome'

interface StyleWrapProps {
  style: string
}

export const browser: typeof SinonChrome = window.browser as any

export const StyleWrap: FC<StyleWrapProps> = props => {
  return (
    <div className="local-style-wrap">
      <style>{props.style}</style>
      {props.children}
    </div>
  )
}

/**
 * Workaround for {@link https://github.com/storybookjs/storybook/issues/729}
 */
export function withLocalStyle(style: object | string) {
  return function LocalStyle(fn) {
    return <StyleWrap style={style.toString()}>{fn()}</StyleWrap>
  }
}

export const I18nNS: FC<{ story: Function }> = props => {
  const [, setLang] = useState(i18next.language)

  useEffect(() => {
    const onLangChanged = (lang: string) => {
      setLang(lang)
    }

    i18next.on('languageChanged', onLangChanged)

    return () => i18next.off('languageChanged', onLangChanged)
  }, [])

  return <>{props.story()}</>
}

export function withi18nNS(ns: string | string[]) {
  // eslint-disable-next-line react/display-name
  return fn => {
    i18next.loadNamespaces(ns)
    return <I18nNS story={fn} />
  }
}

/**
 * Perform side effects and clean up when switching stroies
 * @param fn performs side effects and optionally returns a clean-up function
 */
export function withSideEffect(fn: React.EffectCallback) {
  const SideEffect: FC<{ story: Function }> = props => {
    useEffect(fn, [])
    return <>{props.story()}</>
  }
  // eslint-disable-next-line react/display-name
  return story => <SideEffect story={story} />
}

/**
 * Fake salalict panel
 */
export function withSaladictPanel(children: React.ReactNode) {
  return function SaladcitPanel(story: Function) {
    const width = number('Panel Width', 450)
    const height = number('Panel Height', 450 * 1.68)
    const withAnimation = boolean('Enable Animation', true)
    const fontSize = number('Panel Font Size', 13)

    return (
      <root.div style={{ width, margin: '10px auto' }}>
        <style>{require('@/_sass_global/_reset.scss').toString()}</style>
        <div
          className={withAnimation ? 'isAnimate' : ''}
          style={{
            fontSize,
            width,
            '--panel-width': `${width}px`,
            '--panel-height': `${height}px`,
            '--panel-color': text('Panel Color', '#333'),
            '--panel-background-color': text('Panel Background Color', '#fff')
          }}
        >
          {children}
          {story({
            width,
            height,
            fontSize,
            withAnimation
          })}
        </div>
      </root.div>
    )
  }
}
