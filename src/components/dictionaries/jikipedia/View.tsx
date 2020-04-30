import React, { FC } from 'react'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { JikipediaResult } from './engine'

export const Jikipedia: FC<ViewPorps<JikipediaResult>> = ({ result }) => (
  <ul className="dictJikipedia-List">
    {result.map(item => (
      <li key={item.title + item.url} className="dictJikipedia-Item">
        <h2 className="dictJikipedia-Title">
          <a href={item.url} target="_blank" rel="nofollow noopener noreferrer">
            {item.title}
          </a>
        </h2>
        {item.content && (
          <div
            className="dictJikipedia-Content"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}
        <footer className="dictJikipedia-Footer">
          {item.author && (
            <a
              className="dictJikipedia-Author"
              href={item.author.url}
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              {item.author.name}
            </a>
          )}
          {item.likes > 0 && (
            <span className="dictJikipedia-Thumbs">
              <svg
                className="dictJikipedia-IconThumbsUp"
                width="0.9em"
                height="0.9em"
                fill="#666"
                viewBox="0 0 561 561"
              >
                <path d="M0 535.5h102v-306H0v306zM561 255c0-28.05-22.95-51-51-51H349.35l25.5-117.3v-7.65c0-10.2-5.1-20.4-10.2-28.05L336.6 25.5 168.3 193.8c-10.2 7.65-15.3 20.4-15.3 35.7v255c0 28.05 22.95 51 51 51h229.5c20.4 0 38.25-12.75 45.9-30.6l76.5-181.05c2.55-5.1 2.55-12.75 2.55-17.85v-51H561c0 2.55 0 0 0 0z" />
              </svg>
              {item.likes}
            </span>
          )}
        </footer>
      </li>
    ))}
  </ul>
)

export default Jikipedia
