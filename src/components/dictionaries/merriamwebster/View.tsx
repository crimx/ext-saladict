import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { MerriamWebsterResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictMerriamWebster: FC<ViewPorps<MerriamWebsterResult>> = ({
  result
}) => (
  <ul className="dictMerriamWebster-List">
    {result.map((def, defI) => (
      <li key={def.meaning} className="dictMerriamWebster-Item">
        <div className="dictMerriamWebster-TitleBox">
          <sup className="dictMerriamWebster-Sup">{defI + 1}</sup>
          <span className="dictMerriamWebster-Title">{def.title}</span>
          <span className="dictMerriamWebster-Pos">{def.pos}</span>
          <Speaker src={def.pron} />
        </div>

        <div className="dictMerriamWebster-PronBox">
          {def.syllables && (
            <>
              <span className="dictMerriamWebster-Syllables">
                {def.syllables}
              </span>
              <span className="dictMerriamWebster-Break">|</span>
            </>
          )}
          {def.pr && <span>\{def.pr}\</span>}

          {def.headword && (
            <div>
              <p
                className="dictMerriamWebster-Headword"
                dangerouslySetInnerHTML={{ __html: def.headword }}
              />
            </div>
          )}
        </div>

        {def.meaning && (
          <p
            className="dictMerriamWebster-Meaning"
            dangerouslySetInnerHTML={{ __html: def.meaning }}
          />
        )}

        {def.definition && (
          <p
            className="dictMerriamWebster-Definition"
            dangerouslySetInnerHTML={{ __html: def.definition }}
          />
        )}
      </li>
    ))}
  </ul>
)

export default DictMerriamWebster
