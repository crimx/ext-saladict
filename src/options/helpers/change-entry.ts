import React from 'react'

export const ChangeEntryContext = React.createContext<(entry: string) => void>(
  null as any
)
