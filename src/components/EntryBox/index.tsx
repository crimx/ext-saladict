import React from 'react'

export interface EntryBoxProps {
  title: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const EntryBox: React.SFC<EntryBoxProps> = props => {
  return (
    <section
      className={`entryBox-Wrap${props.className ? ` ${props.className}` : ''}`}
      style={props.style}
    >
      <h1 className='entryBox-Title'>{props.title}</h1>
      <div>{props.children}</div>
    </section>
  )
}

export default EntryBox
