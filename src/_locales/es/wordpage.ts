import { locale as _locale } from '../zh-CN/wordpage'

export const locale: typeof _locale = {
  title: {
    history: 'Historial de búsqueda de Saladict',
    notebook: 'Bloc de notas Saladict'
  },

  localonly: 'Solo local',

  column: {
    add: 'Añadir',
    date: 'Fecha',
    edit: 'Editar',
    note: 'Nota',
    source: 'Fuente',
    trans: 'Traducción',
    word: 'Palabra'
  },

  delete: {
    title: 'Eliminar',
    all: 'Eliminar todo',
    confirm: '. ¿Desea eliminarlo?',
    page: 'Eliminar página',
    selected: 'Eliminar seleccionado'
  },

  export: {
    title: 'Exportar',
    all: 'Exportar todo',
    description: 'Exportar a un archivo de texto',
    explain: 'Cómo exportar a ANKI y otras herramientas',
    gencontent: 'Generar contenido',
    linebreak: {
      default: 'Mantener los saltos de línea por defecto',
      n: 'sustituir los saltos de línea por \\n',
      br: 'sustituir los saltos de línea por <br>',
      p: 'sustituir los saltos de línea por <p>',
      space: 'sustituir los saltos de línea por espacios'
    },
    page: 'Exportar página',
    placeholder: 'Marcador',
    htmlescape: {
      title: 'Caracteres HTML de escape en las notas',
      text: 'Escape HTML'
    },
    selected: 'Exportar seleccionado',
  },

  filterWord: {
    chs: 'Chino',
    eng: 'Inglés',
    word: 'Palabra',
    phrase: 'Frase',
  },

  wordCount: {
    selected: '{{count}} elemento seleccionado',
    selected_plural: '{{count}} elemento seleccionado',
    total: '{{count}} elemento total',
    total_plural: '{{count}} elemento total'
  }
}
