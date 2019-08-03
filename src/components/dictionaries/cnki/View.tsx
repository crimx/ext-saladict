import React, { FC } from 'react'
import { CNKIResult } from './engine'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictCambridge: FC<ViewPorps<CNKIResult>> = ({ result }) => (
  <div className="dictCNKI">
    {result.dict.length > 0 && (
      <EntryBox title="英汉汉英词典">
        {result.dict.map(({ word, href }, i) => (
          <a
            key={i}
            className="dictCNKI-DictLink"
            href={href}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {word}
          </a>
        ))}
      </EntryBox>
    )}
    {result.senbi.length > 0 && (
      <EntryBox title="双语例句" className="dictCNKI-Sensbi">
        {result.senbi.map(({ title, more, sens }, i) => (
          <React.Fragment key={i}>
            <h2 className="dictCNKI-SensTitle">{title}</h2>
            {sens.map((sen, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: sen }} />
            ))}
            <div className="dictCNKI-SensMore">
              <a href={more} target="_blank" rel="nofollow noopener noreferrer">
                更多
              </a>
            </div>
          </React.Fragment>
        ))}
      </EntryBox>
    )}
    {result.seneng.length > 0 && (
      <EntryBox title="英文例句" className="dictCNKI-Senseng">
        {result.seneng.map(({ title, more, sens }, i) => (
          <React.Fragment key={i}>
            <h2 className="dictCNKI-SensTitle">{title}</h2>
            {sens.map((sen, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: sen }} />
            ))}
            <div className="dictCNKI-SensMore">
              <a href={more} target="_blank" rel="nofollow noopener noreferrer">
                更多
              </a>
            </div>
          </React.Fragment>
        ))}
      </EntryBox>
    )}
  </div>
)

export default DictCambridge
