import { FC } from 'react'
import { useIsomorphicLayoutEffect } from 'react-use'

export const DocumentTitle: FC<{ title?: string }> = ({ title }) => {
  useIsomorphicLayoutEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title])

  return null
}
