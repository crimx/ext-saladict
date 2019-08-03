import React, { FC, ComponentProps } from 'react'

export interface EntryBoxProps extends ComponentProps<'div'> {
  title: string
}

/**
 * Box-wrapped content
 */
export const EntryBox: FC<EntryBoxProps> = props => {
  const { title, className, children, ...restProps } = props
  return (
    <div
      className={`entryBox-Wrap${className ? ` ${className}` : ''}`}
      {...restProps}
    >
      <section className="entryBox">
        <h1 className="entryBox-Title">{title}</h1>
        <div>{children}</div>
      </section>
    </div>
  )
}

export default EntryBox
