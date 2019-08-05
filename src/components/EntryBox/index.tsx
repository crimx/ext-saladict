import React, { FC, ComponentProps, ReactNode } from 'react'

export interface EntryBoxProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
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
