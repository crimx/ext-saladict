const formDirty = {
  value: false
}

export const setFormDirty = (value: boolean) => {
  formDirty.value = value
}

export const useFormDirty = (): Readonly<typeof formDirty> => formDirty
