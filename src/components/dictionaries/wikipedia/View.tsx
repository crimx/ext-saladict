import React, { FC, ReactNode, useEffect, useRef } from 'react'
import { WikipediaResult, WikipediaPayload } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { useTranslate } from '@/_helpers/i18n'
import { StrElm } from '@/components/StrElm'

export const DictWikipedia: FC<ViewPorps<WikipediaResult>> = ({
  result,
  searchText
}) => {
  const { t } = useTranslate('content')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const $content = contentRef.current
    if (!$content) {
      return
    }

    const frame = requestAnimationFrame(() => {
      initCollapsibleSections($content)
    })

    return () => cancelAnimationFrame(frame)
  }, [result.content])

  const handleSelectChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      searchText<WikipediaPayload>({
        id: 'wikipedia',
        payload: {
          url: e.target.value
        }
      })
    }
  }

  let langSelector: ReactNode = null
  if (result.langList.length > 0) {
    langSelector = (
      <select onChange={handleSelectChanged} defaultValue={''}>
        <option key="" value="">
          {t('chooseLang')}
        </option>
        {result.langList.map(item => (
          <option key={item.url} value={item.url}>
            {item.title}
          </option>
        ))}
      </select>
    )
  }

  return (
    <>
      <h1 className="dictWikipedia-Title">{result.title}</h1>
      {langSelector}
      <div
        className="dictWikipedia-Content"
        ref={contentRef}
        onClick={handleEntryClick}
      >
        <StrElm className="client-js" html={result.content} />
      </div>
    </>
  )
}

function handleEntryClick(e: React.MouseEvent<HTMLDivElement>) {
  if (!e.target['classList']) {
    return
  }

  const $heading = (e.target as HTMLElement).closest('.mw-heading')
  if (!$heading || !(e.currentTarget as HTMLElement).contains($heading)) {
    return
  }

  const level = getHeadingLevel($heading)
  if (!level) {
    return
  }

  e.stopPropagation()
  e.preventDefault()

  const collapsed = !$heading.classList.contains('dictWikipedia-Collapsed')
  collapseSection($heading as HTMLElement, collapsed)
}

function initCollapsibleSections($content: HTMLElement) {
  const $headings = [
    ...$content.querySelectorAll<HTMLElement>('.mw-heading')
  ].filter(
    $heading =>
      !$heading.nextElementSibling?.classList.contains(
        'dictWikipedia-SectionBody'
      )
  )

  $headings.forEach($heading => {
    const level = getHeadingLevel($heading)
    if (!level || !$heading.parentElement) {
      return
    }

    const $body = document.createElement('div')
    $body.className = 'dictWikipedia-SectionBody'
    $heading.insertAdjacentElement('afterend', $body)

    let $sibling = $body.nextElementSibling
    while ($sibling) {
      const siblingLevel = getHeadingLevel($sibling)
      if (siblingLevel && siblingLevel <= level) {
        break
      }

      const $next = $sibling.nextElementSibling
      $body.appendChild($sibling)
      $sibling = $next
    }
  })

  $content.querySelectorAll<HTMLElement>('.mw-heading').forEach($heading => {
    collapseSection($heading, true)
  })
}

function collapseSection($heading: HTMLElement, collapsed: boolean) {
  const $body = $heading.nextElementSibling as HTMLElement | null
  if (!$body || !$body.classList.contains('dictWikipedia-SectionBody')) {
    return
  }

  $heading.classList.toggle('dictWikipedia-Collapsed', collapsed)
  $heading.setAttribute('aria-expanded', (!collapsed).toString())
  $body.hidden = collapsed
}

function getHeadingLevel($el: Element): number {
  const $heading = $el.classList.contains('mw-heading')
    ? $el
    : $el.querySelector('.mw-heading')
  if (!$heading) {
    return 0
  }

  const $title = $heading.querySelector('h1,h2,h3,h4,h5,h6')
  if (!$title) {
    return 0
  }

  return Number($title.tagName.slice(1))
}

export default DictWikipedia
