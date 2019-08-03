import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { CambridgeResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictCambridge: FC<ViewPorps<CambridgeResult>> = props => (
  <>
    {props.result.map(entry => (
      <section
        key={entry.defs}
        className="dictCambridge-Entry"
        onClick={handleEntryClick}
      >
        <header className="dictCambridge-Header">
          <h1 className="dictCambridge-Title">{entry.title}</h1>
          <span dangerouslySetInnerHTML={{ __html: entry.pos }} />
        </header>
        {entry.prons.length > 0 && (
          <div className="dictCambridge-Prons">
            {entry.prons.map((p, i) => (
              <React.Fragment key={p.pron}>
                {p.phsym} <Speaker src={p.pron} />{' '}
                {p.phsym.startsWith('us') ? <br /> : null}
              </React.Fragment>
            ))}
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: entry.defs }} />
      </section>
    ))}
  </>
)

export default DictCambridge

function handleEntryClick(e: React.MouseEvent<HTMLElement>) {
  const target = e.nativeEvent.target as HTMLDivElement
  if (target && target.classList && target.classList.contains('js-accord')) {
    target.classList.toggle('open')
  }
}
