import { locale as _locale } from '../zh-CN/content'

export const locale: typeof _locale = {
  chooseLang: 'elegir otro idioma',
  standalone: 'Panel de Saladict independiente',
  fetchLangList: 'Obtener la lista completa de idiomas',
  transContext: 'Retraducir',
  neverShow: 'Dejar de mostrar',
  fromSaladict: 'Desde el panel de Saladict',
  tip: {
    historyBack: 'Historial de búsqueda anterior',
    historyNext: 'Siguiente historial de búsqueda',
    searchText: 'Buscar texto',
    openOptions: 'Abrir opciones',
    addToNotebook: 'Agregar al cuaderno. Haga clic derecho para abrir el cuaderno',
    openNotebook: 'Abrir cuaderno',
    openHistory: 'Abrir historial',
    shareImg: 'Compartir como imagen',
    pinPanel: 'Fijar el panel',
    closePanel: 'Cerrar el panel',
    sidebar: 'Cambiar a modo barra lateral. Haga clic derecho para el lado derecho.',
    focusPanel: 'El panel gana foco al buscar',
    unfocusPanel: 'El panel no gana foco al buscar'
  },
  wordEditor: {
    title: 'Agregar al cuaderno',
    wordCardsTitle: 'Otros resultados del cuaderno',
    deleteConfirm: '¿Eliminar del cuaderno?',
    closeConfirm: 'Los cambios no se guardarán. ¿Estás seguro de cerrar?',
    chooseCtxTitle: 'Elija los resultados traducidos',
    ctxHelp:
      'Mantenga el formato [:: xxx ::] y --------------- si desea que Saladict maneje la selección de traducción y genere una tabla de Anki.'
  },
  machineTrans: {
    switch: 'Cambiar idioma',
    sl: 'Idioma de origen',
    tl: 'Idioma de destino',
    auto: 'Detectar idioma',
    stext: 'Original',
    showSl: 'Mostrar fuente',
    copySrc: 'Copiar fuente',
    copyTrans: 'Copiar traducción',
    login: 'Proporcione {access token}.',
    dictAccount: 'access token'
  },
  updateAnki: {
    title: 'Actualizar a Anki',
    success: 'Se actualizó correctamente la palabra a Anki.',
    failed: 'No se pudo actualizar la palabra a Anki.'
  }
}
