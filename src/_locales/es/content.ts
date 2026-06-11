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
    addToNotebook:
      'Agregar al cuaderno. Haga clic derecho para abrir el cuaderno',
    openNotebook: 'Abrir cuaderno',
    openHistory: 'Abrir historial',
    shareImg: 'Compartir como imagen',
    pinPanel: 'Fijar el panel',
    closePanel: 'Cerrar el panel',
    sidebar:
      'Cambiar a modo barra lateral. Haga clic derecho para el lado derecho.',
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
    credential: {
      missing: 'Proporcione {access token}.',
      invalid: 'El access token no es válido. Revise {access token}.',
      quota: 'El access token no tiene cuota disponible. Revise {access token}.'
    },
    login: 'Proporcione {access token}.',
    dictAccount: 'access token'
  },
  manualVerification: {
    title: 'Se requiere verificación manual',
    message:
      'Abra la página original del diccionario y complete la verificación humana, luego vuelva a buscar en Saladict.',
    openPage: 'Abrir página del diccionario'
  },
  updateAnki: {
    title: 'Actualizar a Anki',
    success: 'Se actualizó correctamente la palabra a Anki.',
    failed: 'No se pudo actualizar la palabra a Anki.'
  }
}
