import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { UrbanResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

export const DictUrban: FC<ViewPorps<UrbanResult>> = ({ result }) => (
  <ul className="dictUrban-List">
    {result.map(def => (
      <li key={def.meaning} className="dictUrban-Item">
        <h2 className="dictUrban-Title">
          {def.title} <Speaker src={def.pron} />
        </h2>
        {def.meaning && (
          <StrElm tag="p" className="dictUrban-Meaning" html={def.meaning} />
        )}
        {def.example && (
          <StrElm tag="p" className="dictUrban-Example" html={def.example} />
        )}
        {def.gif && (
          <figure className="dictUrban-Gif">
            <img src={def.gif.src} alt={def.gif.attr} />
            <figcaption>{def.gif.attr}</figcaption>
          </figure>
        )}
        {def.tags && (
          <ul className="dictUrban-Tags">
            {def.tags.map(tag => (
              <a
                key={tag}
                className="dictUrban-TagItem"
                href={`https://www.urbandictionary.com/tags.php?tag=${tag}`}
                rel="nofollow noopener noreferrer"
              >
                #{tag}{' '}
              </a>
            ))}
          </ul>
        )}
        <footer className="dictUrban-Footer">
          {def.contributor && (
            <span className="dictUrban-Contributor">{def.contributor}</span>
          )}
          {typeof def.thumbsUp === 'number' && (
            <span className="dictUrban-Thumbs">
              <svg
                className="dictUrban-IconThumbsUp"
                width="0.9em"
                height="0.9em"
                fill="#666"
                viewBox="0 0 561 561"
              >
                <path d="M0 535.5h102v-306H0v306zM561 255c0-28.05-22.95-51-51-51H349.35l25.5-117.3v-7.65c0-10.2-5.1-20.4-10.2-28.05L336.6 25.5 168.3 193.8c-10.2 7.65-15.3 20.4-15.3 35.7v255c0 28.05 22.95 51 51 51h229.5c20.4 0 38.25-12.75 45.9-30.6l76.5-181.05c2.55-5.1 2.55-12.75 2.55-17.85v-51H561c0 2.55 0 0 0 0z" />
              </svg>
              {def.thumbsUp}
            </span>
          )}
          {typeof def.thumbsDown === 'number' && (
            <span className="dictUrban-Thumbs">
              <svg
                className="dictUrban-IconThumbsDown"
                width="0.95em"
                height="0.95em"
                fill="#666"
                viewBox="0 0 561 561"
              >
                <path d="M357 25.5H127.5c-20.4 0-38.25 12.75-45.9 30.6L5.1 237.15C2.55 242.25 0 247.35 0 255v51c0 28.05 22.95 51 51 51h160.65l-25.5 117.3v7.65c0 10.2 5.1 20.4 10.2 28.05l28.05 25.5 168.3-168.3c10.2-10.2 15.3-22.95 15.3-35.7v-255c0-28.05-22.95-51-51-51zm102 0v306h102v-306H459z" />
              </svg>
              {def.thumbsDown}
            </span>
          )}
        </footer>
      </li>
    ))}
  </ul>
)

export default DictUrban
