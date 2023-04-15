import { locale as _locale } from '../zh-CN/options'

export const locale: typeof _locale = {
  title: 'Saladict Opciones',
  previewPanel: 'Panel de vista previa',
  shortcuts: 'Atajos de teclado',
  msg_update_error: 'Error al actualizar',
  msg_updated: 'Actualizado',
  msg_first_time_notice: '¡Bienvenido a Saladict!',
  msg_err_permission: 'No se ha podido solicitar el permiso "{{permission}}".',
  unsave_confirm: 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?',
  nativeSearch: 'Buscar con el motor de búsqueda nativo',
  firefox_shortcuts:
    'Abra about:addons, haga clic en el botón superior derecho "engranaje", elija la última "Administrar accesos directos de extensión".',
  tutorial: 'Tutorial',
  page_selection: 'Selección de página',

  nav: {
    General: 'General',
    Notebook: 'Bloc de notas',
    Profiles: 'Perfiles',
    DictPanel: 'Panel de diccionario',
    SearchModes: 'Modos de búsqueda',
    Dictionaries: 'Diccionarios',
    DictAuths: 'Access Tokens',
    Popup: 'Popup Panel',
    QuickSearch: 'Busqueda rápida',
    Pronunciation: 'Pronunciación',
    PDF: 'PDF',
    ContextMenus: 'Menús de contexto',
    BlackWhiteList: 'Lista negra/Blanca',
    ImportExport: 'Importar/Exportar',
    Privacy: 'Privacidad',
    Permissions: 'Permisos',
  },

    config: {
    active: 'Activar el traductor en línea',
    active_help:
      'Si está desactivado, el traductor en línea no se mostrará en el panel de búsqueda rápida.',
    animation: 'Transiciones de animación',
    animation_help: 'Desactive las transiciones de animación para mejorar el rendimiento.',
    runInBg: 'Ejecutar en segundo plano',
    runInBg_help:
      'Si está desactivado, Saladict se cerrará cuando se cierre la última ventana.',
    darkMode: ' Modo oscuro',
    langCode: 'Idioma de Saladict',
    editOnFav: 'Abrir WordEditor al guardar',
    editOnFav_help:
      'Si está desactivado, WordEditor se abrirá cuando se agregue una palabra nueva.',
    searchHistory: 'Historial de búsqueda',
    searchHistory_help:
      'Si está desactivado, el historial de búsqueda no se mostrará en el panel de búsqueda rápida.',
    searchHistoryInco: 'Incluir búsqueda de incógnito',
    ctxTrans: 'Traducir contexto',
    ctxTrans_help:
      'Si está desactivado, el contexto no se mostrará en el panel de búsqueda rápida.',
    searchSuggests: 'Sugerencias de búsqueda',
    panelMaxHeightRatio: 'Altura máxima del panel',
    panelWidth: 'Ancho del panel',
    fontSize: 'Tamaño de fuente',
    bowlOffsetX: 'Desplazamiento X del icono de Saladict',
    bowlOffsetY: 'Desplazamiento Y del icono de Saladict',
    panelCSS: 'CSS personalizado',
    panelCSS_help:
      'CSS personalizado. Para el panel de dictado, utilice .dictPanel-Root como raíz. Para diccionarios utilice .dictRoot o .d-{id} como raíz.',
    noTypeField: 'No hay selección en las regiones editables',
    noTypeField_help:
      'Si la selección en regiones editables está prohibida, la extensión identificará los cuadros de entrada, las áreas de texto y otros editores de texto comunes como CodeMirror, ACE y Monaco.',
    touchMode: 'Modo táctil',
    touchMode_help: 'Activar la selección táctil',
    language: 'Selección de idiomas',
    language_help:
      'Buscar cuando la selección contiene palabras en los idiomas elegidos.',
    language_extra:
      'Tenga en cuenta que el japonés y el coreano también incluyen el chino. El francés, el alemán y el español también incluyen el inglés. Si se cancela el chino o el inglés mientras se seleccionan otros, sólo se comprueban las partes exclusivas de esos idiomas. Por ejemplo, los caracteres kana en japonés.',
    doubleClickDelay: 'Retraso de doble clic',
    mode: 'Seleccion normal',
    panelMode: 'Interior del panel Dict',
    pinMode: 'Cuando el panel está fijado',
    qsPanelMode: 'Cuando se abre el panel independiente',
    bowlHover: 'Icono al pasar el cursor por encima',
    bowlHover_help:
      'Pase el ratón sobre el icono del cuenco para activar la búsqueda en lugar de hacer clic.',
    autopron: {
      cn: {
        dict: 'Autopronunciación en chino'
      },
      en: {
        dict: 'Autopronunciación en inglés',
        accent: 'Preferencia de acento'
      },
      machine: {
        dict: 'Autopronunciación de la máquina',
        src: 'Pronunciar a máquina',
        src_help:
          'El diccionario de traducción automática debe añadirse y activarse en la siguiente lista para activar la pronunciación automática.',
        src_search: 'Leer texto original',
        src_trans: 'Leer el texto de la traducción'
      }
    },
    pdfSniff: 'Activar PDF Sniffer',
    pdfSniff_help: 'Si está activada, los enlaces PDF se capturarán automáticamente.',
    pdfSniff_extra:
      'Se recomienda {search selected text outside of browser} con su propio lector local favorito.',
    pdfStandalone: 'Panel independiente',
    pdfStandalone_help: 'Abrir visor de PDF en panel independiente.',
    baWidth: 'Anchura',
    baWidth_help:
      'Navegador Acción Panel con. Si se elige un valor negativo, se utilizará la anchura del panel.',
    baHeight: 'Altura',
    baHeight_help: 'Navegador Acción Panel altura.',
    baOpen: 'Acción del navegador',
    baOpen_help:
      'Al pulsar el icono de acción del navegador en la barra de herramientas (junto a la barra de direcciones). Los elementos son los mismos que los menús contextuales, que pueden añadirse o editarse en la página de configuración de menús contextuales.',
    tripleCtrl: 'Activar tecla corta Ctrl',
    tripleCtrl_help:
      'Pulse {⌘ Command}(macOS) o {Ctrl}(Otros) tres veces (o con la tecla rápida del navegador) para acceder al panel del diccionario.',
    defaultPinned: 'Fijado cuando aparece',
    qsLocation: 'Ubicación',
    qsFocus: 'Concéntrese cuando aparezca',
    qsStandalone: 'Independiente',
    qsStandalone_help:
      'Renderizar el panel de dictado en una ventana independiente. Puede {buscar texto seleccionado fuera del navegador}.',
    qssaSidebar: 'Barra lateral',
    qssaSidebar_help: 'Renderizar el panel de dictado en la barra lateral.',
    qssaHeight: 'Ventana altura',
    qssaPageSel: 'Selección de página',
    qssaPageSel_help: 'Seleccionar automáticamente el texto de la página.',
    qssaRectMemo: 'Recordar tamaño y posición',
    qssaRectMemo_help: 'Recuerde el tamaño y la posición del panel independiente al cerrar.',
    updateCheck: 'Comprobar actualizaciones',
    updateCheck_help: 'Compruebe si hay actualizaciones automáticamente.',
    analytics: 'Activar Google Analytics',
    analytics_help:
      'Compartir información anónima sobre la versión del navegador del dispositivo. El autor de Saladict ofrecerá soporte prioritario a los dispositivos y navegadores más populares.',

    opt: {
      reset: 'Restablecer configuración',
      reset_confirm: '¿Estás seguro de que quieres restablecer la configuración?',
      upload_error: 'Error al cargar la configuración',
      accent: {
        uk: 'UK',
        us: 'US'
      },
      sel_blackwhitelist: 'Lista negra y blanca de selección',
      sel_blackwhitelist_help:
        'Saladict no reaccionará a la selección en páginas de la lista negra.',
      pdf_blackwhitelist_help:
        'Los enlaces PDF de la lista negra no saltarán a Saladict PDF Viewer.',
      contextMenus_description:
        'Cada elemento del menú contextual también se puede personalizar. Youdao y Google Traductor están obsoletos en favor de las extensiones oficiales.',
      contextMenus_edit: 'Editar elementos de menús contextuales',
      contextMenus_url_rules: 'URL con %s en lugar de query.',
      baOpen: {
        popup_panel: 'Panel de diccionario',
        popup_fav: 'Añadir al bloc de notas',
        popup_options: 'Abrir opciones de Saladict',
        popup_standalone: 'Panel independiente Open Saladict'
      },
      openQsStandalone: 'Opciones de panel independiente',
      pdfStandalone: {
        default: 'Nunca',
        always: 'Siempre',
        manual: 'Manual'
      }
    }
  },

  matchPattern: {
    description:
      'Especifique URL como {URL Patrón de Coincidencia} o {Expresión Regular}. Se eliminarán los campos vacíos.',
    url: 'URL Patrón de Coincidencia',
    url_error: 'Patrón de coincidencia de URL incorrecto.',
    regex: 'Expresión regular',
    regex_error: 'Expresión regular incorrecta.'
  },

  searchMode: {
    icon: 'Mostrar icono',
    icon_help: 'Aparecerá un bonito icono cerca del cursor.',
    direct: 'Busqueda directa',
    direct_help: 'Mostrar directamente el panel dict.',
    double: 'Doble clic',
    double_help: 'Mostrar panel de dict después de la selección de doble clic.',
    holding: 'Mantener pulsado',
    holding_help:
      'Después de realizar una selección, la tecla seleccionada debe estar pulsada al soltar el ratón (Alt es "⌥ Opción" en macOS. Meta es "⌘ Comando" en macOS y "⊞ Windows" para los demás).',
    instant: 'Captura instantánea',
    instant_help: 'La selección se realiza automáticamente cerca del cursor.',
    instantDirect: 'Directo',
    instantKey: 'Tecla',
    instantKey_help:
    'Si se elige "Directo", también se recomienda configurar la tecla de acceso directo del navegador para activar la Captura instantánea. De lo contrario, la selección de texto en el navegador podría ser imposible.',
    instantDelay: 'Retraso de captura'
  },

  profiles: {
    opt: {
      add_name: 'Añadir nombre de perfil',
      delete_confirm: 'Eliminar Perfil "{{name}}". ¿Confirmar?',
      edit_name: 'Cambiar el nombre del perfil',
      help:
        'Cada perfil representa un conjunto independiente de ajustes. Algunos de los ajustes (con el prefijo {*}) cambian según el perfil. Para cambiar de perfil, sitúe el cursor sobre el icono de menú del panel de dictado, o bien sitúe el cursor sobre el icono y pulse {↓}.'
    }
  },

  profile: {
    mtaAutoUnfold: 'Despliegue automático del cuadro de búsqueda multilínea',
    waveform: 'Forma de onda',
    waveform_help:
      'Muestra un botón en la parte inferior del panel de dictado para expandir el panel de control de forma de onda que sólo se carga después de la expansión.',
    stickyFold: 'Plegado adhesivo',
    stickyFold_help:
      'Recuerda los estados de plegado/desplegado del diccionario manual al buscar. Sólo dura en la misma página.',

    opt: {
      item_extra: 'Esta opción puede cambiar en función del "Perfil".',
      mtaAutoUnfold: {
        always: 'Siempre Desplegar',
        never: 'Nunca Desplegar',
        once: 'Desplegar una vez',
        popup: 'Sólo en la acción del navegador',
        hide: 'Ocultar'
      },
      dict_selected: 'Seleccionar diccionarios',
    }
  },

  dict: {
    add: 'Añadir diccionarios',
    more_options: 'Mas opciones',

    selectionLang: 'Seleccionar idiomas',
    selectionLang_help:
      'Muestra este diccionario cuando la selección contiene palabras en los idiomas elegidos.',
    defaultUnfold: 'Despliegue por defecto',
    defaultUnfold_help:
      "Si está desactivado, este diccionario no iniciará la búsqueda a menos que se haga clic en su barra de título.",
    selectionWC: 'Selección Número de palabras',
    selectionWC_help:
      'Muestre este diccionario cuando el recuento de palabras de la selección cumpla los requisitos. Establezca 999999 para un número ilimitado de palabras.',
    preferredHeight: 'Altura predeterminada del panel',
    preferredHeight_help:
      'Altura máxima en la primera aparición. Los contenidos que superen esta altura se ocultarán. Establezca 999999 para una altura ilimitada.',

    lang: {
      de: 'De',
      en: 'En',
      es: 'Es',
      fr: 'Fr',
      ja: 'Ja',
      kor: 'Kor',
      zhs: 'Zhs',
      zht: 'Zht'
    }
  },

  syncService: {
    description: 'Ajustes de sincronización.',
    start: 'Sincronizando. No cierre esta página hasta que haya terminado.',
    finished: 'Sincronización finalizada',
    success: 'Sincronización correcta',
    failed: 'Sincronización fallida',
    close_confirm: 'No se ha guardado la configuración. ¿Cerrar?',
    delete_confirm: '¿Eliminar?',

    shanbay: {
      description:
      " Vaya a shanbay.com y conéctese primero(debe permanecer conectado). Tenga en cuenta que se trata de una sincronización unidireccional (de Saladict a Shanbay). Sólo se sincronizan las nuevas palabras añadidas. Las palabras también deben ser compatibles con la base de datos de Shanbay.",
      login:
        'Se abrirá shanbay.com. Por favor, inicie sesión y luego volver y habilitar de nuevo.',
      sync_all: 'Cargar todas las palabras nuevas existentes',
      sync_all_confirm:
        'Demasiadas palabras nuevas en el cuaderno. Saladict cargará por lotes. Ten en cuenta que si subes demasiadas palabras en un periodo corto de tiempo, tu cuenta será bloqueada y no se podrá recuperar. ¿Confirmar?',
      sync_last: 'Cargar la última palabra nueva'
    },

    eudic: {
      description:
        'Antes de utilizar Eudic para sincronizar palabras, primero debe crear un nuevo libro de palabras predeterminado en el sitio web oficial de Eudic (my.eudic.net/home/index) (por lo general, se generará automáticamente y no se podrá eliminar después de la primera importación manual). Preste atención a no sincronizar con frecuencia en poco tiempo, ya que podría provocar un bloqueo temporal.',
      token: 'Información sobre la autorización',
      getToken: 'Obtener autorización',
      verify: 'Comprobar la información de autorización',
      verified: 'Información de autorización Eudic comprobada correctamente',
      enable_help:
        'Tras la apertura, cada nueva palabra añadida se sincronizará automáticamente con el libro de palabras predeterminado de Eudic (ensalada al libro de palabras de Eudic) en una dirección, y sólo se sincronizará la nueva palabra en sí (eliminada fuera de sincronización)',
      token_help:
        'Por favor, confirme que la información de autorización personal es válida, de lo contrario la sincronización fallará. Puede hacer clic en el botón de la parte inferior para comprobarlo.',
      sync_all: 'Sincronizar todas las palabras nuevas',
      sync_help:
        'Sincronice todas las palabras nuevas existentes en el libro de palabras de la ensalada con el libro de palabras predeterminado de Eudic (active el interruptor de sincronización anterior al mismo tiempo y haga clic en guardar).',
      sync_all_confirm:
        'Tenga en cuenta que una sincronización frecuente en poco tiempo puede provocar un bloqueo temporal. ¿Está seguro de continuar?'
    },

    webdav: {
      description:
        'La configuración de las extensiones (incluida esta) se sincroniza a través del navegador. El cuaderno de nuevas palabras se puede sincronizar mediante WebDAV a través de la configuración aquí.',
      jianguo: 'Véase Jianguoyun, por ejemplo',
      checking: 'Conectando...',
      exist_confirm:
        'El directorio Saladict existe en el servidor. ¿Descargarlo y fusionarlo con los datos locales?',
      upload_confirm: '¿Subir los datos locales al servidor de inmediato?',
      verify: 'Verificar servidor',
      verified: 'Verificado con éxito el servidor WebDAV.',
      duration: 'Duracion',
      duration_help:
      'Se garantiza que los datos se actualizan antes de cargarlos. Si no necesita sincronización en tiempo real entre navegadores, establezca un ciclo de sondeo más largo para reducir el consumo de CPU y memoria.',
      passwd: 'Contraseña',
      url: 'Dirección del servidor',
      user: 'Usuario',
    },

    ankiconnect: {
      description:
        'Por favor, asegúrate de que el plugin Anki Connect está instalado y Anki se está ejecutando. También puede actualizar la palabra a Anki en el editor de Word.',
      checking: 'Verificando...',
      deck_confirm:
        'El tablero "{{deck}}" no existe en Anki. ¿Generar un nuevo tablero?',
      deck_error: 'No se puede crear el tablero "{{deck}}".',
      notetype_confirm:
        'El tipo de nota "{{noteType}}" no existe en Anki. Genera un nuevo tipo de nota.',
      notetype_error: 'No se puede crear el tipo de nota"{{noteType}}".',
      upload_confirm:
        '¿Sincronizar nuevas palabras locales a Anki inmediatamente? Las palabras duplicadas (con la misma marca de tiempo) se omitirán.',
      add_yourself: 'Por favor, añádelo tú mismo en Anki.',
      verify: 'Verificar Anki Connect',
      verified: 'Anki Connect verificado correctamente.',
      enable_help:
        'Cuando está activada, cada vez que se añade una nueva palabra al Cuaderno, también se transfiere automáticamente a Anki. Las palabras que existen en Anki (con la misma "Fecha") pueden ser forzadas a actualizarse en el Editor de Palabras.',
      host: 'Dirección',
      port: 'Puerto',
      key: 'Clave',
      key_help:
        'Se puede añadir una clave opcional en la configuración de Anki Connect para la identificación.',
      deckName: 'Tablero',
      deckName_help:
        'Si el tablero no existe, puedes generar uno automáticamente haciendo clic en "Verificar Anki Connect" más abajo.',
      noteType: 'Tipo de nota',
      noteType_help:
        'El tipo de nota Anki incluye un conjunto de campos y un tipo de tarjeta. Si el tipo de nota no existe puedes generar uno por defecto automáticamente haciendo clic en "Verificar Anki Connect" más abajo. NO cambie los nombres de los campos cuando edite o añada plantillas de tarjetas en Anki',
      tags: 'Etiquetas',
      tags_help: 'Anki notes can include tags separated with commas.',
      escapeHTML: 'Escapar HTML',
      escapeHTML_help:
        'Escapar entidades HTML. Desactivar si se utiliza HTML para la maquetación manual.',
      syncServer: 'Sincronizar con el servidor',
      syncServer_help:
        'Sincronización con el servidor (p.e. AnkiWeb) después de añadir nuevas palabras al Anki local.'
    }
  },

  titlebarOffset: {
    title: 'Calibración de la altura de la barra de título',
    help:
      'La altura de la barra de título puede variar según el sistema o la configuración del navegador. Saladict intentará calibrarla automáticamente. Si puede ajustar manualmente.',
    main: 'Normal',
    main_help: 'Las ventanas normales pueden no tener barra de título.',
    panel: 'Panel',
    panel_help:
      'El panel de búsqueda rápida independiente de Saladict es un tipo de ventana de panel.',
    calibrate: 'Auto-calibrate',
    calibrateSuccess: 'Calibración correcta',
    calibrateError: 'Error de calibración'
  },

  headInfo: {
    acknowledgement: {
      title: 'Reconocimiento',
      yipanhuasheng:
        "por añadir los diccionarios Merriam Webster's Dict, American Heritage Dict, Oxford Learner's Dict y el servicio de sincronización Eudic Notebook; y por actualizar los diccionarios Urban Dict y Naver Dict.",
      naver: 'por ayudar a añadir Naver dict',
      shanbay: 'por añadir Shanbay dict',
      trans_tw: 'por la traducción al chino tradicional',
      weblio: 'por ayudar a añadir Weblio dict'
    },
    contact_author: 'Contactar al autor',
    donate: 'Donar',
    instructions: 'Instrucciones',
    report_issue: 'Informar de un problema',
  },

  form: {
    url_error: 'URL incorrecta.',
    number_error: 'Numero incorrecto.'
  },

  preload: {
    title: 'Precarga',
    auto: 'Búsqueda automática',
    auto_help: 'Búsqueda automática cuando aparece el panel.',
    clipboard: 'Clipboard',
    help: 'Precarga de contenido en el cuadro de búsqueda cuando aparece el panel.',
    selection: 'Selección de página'
  },

  locations: {
    CENTER: 'Centrado',
    TOP: 'Arriba',
    RIGHT: 'Derecha',
    BOTTOM: 'Abajo',
    LEFT: 'Izquierda',
    TOP_LEFT: 'Arriba a la izquierda',
    TOP_RIGHT: 'Arriba a la derecha',
    BOTTOM_LEFT: 'Abajo a la izquierda',
    BOTTOM_RIGHT: 'Abajo a la derecha'
  },

  import_export_help:
    'Las configuraciones se sincronizan automáticamente a través del navegador. Aquí también puede importar/exportar manualmente. Las copias de seguridad se exportan como archivos de texto sin formato. Por favor, codifíquelos usted mismo si es necesario.',

  import: {
    title: 'Importar Configuraciones',
    error: {
      title: 'Error de importación',
      parse: 'No se ha podido analizar la copia de seguridad. Formato incorrecto.',
      load: 'No se puede cargar la copia de seguridad. El navegador no puede obtener el archivo local.',
      empty: 'No se han encontrado datos válidos en la copia de seguridad.'
    }
  },

  export: {
    title: 'Exportar Configuraciones',
    error: {
      title: 'Error de exportación',
      empty: 'No hay configuración para exportar.',
      parse: 'No se pueden analizar las configuraciones.'
    }
  },

  dictAuth: {
    description:
      'A medida que crece el número de usuarios de Saladict, si hace un uso intensivo de los servicios de traducción automática se recomienda registrar una cuenta para mejorar la estabilidad y la precisión. Los datos de la cuenta sólo se almacenarán en el navegador.',
    dictHelp: 'Consulte el sitio web oficial de {dict}.',
    manage: 'Gestionar cuentas de traductor'
  },

  third_party_privacy: 'Privacidad de terceros',
  third_party_privacy_help:
    'Saladict no recopilará más información, pero el texto de la búsqueda y las cookies correspondientes se enviarán a servicios de diccionarios de terceros (igual que si buscara en sus sitios web). Si no desea que los servicios de terceros recopilen sus datos, elimine los diccionarios correspondientes en la configuración de "Diccionarios".',
  third_party_privacy_extra:
    'No se puede desactivar, ya que es la funcionalidad principal de Saladict.',

  permissions: {
    success: 'Permiso solicitado',
    cancel_success: 'Permiso cancelado',
    failed: 'Solitud de permiso fallida',
    cancelled: 'Solicitud de permiso cancelada por el usuario',
    missing:
      'Falta el permiso "{{permission}}". Concederlo o desactivar las funciones relacionadas.',
    clipboardRead: 'Leer portapapeles',
    clipboardRead_help:
      'Este permiso es necesario cuando la precarga del portapapeles está activada para el panel emergente o el panel de búsqueda rápida.',
    clipboardWrite: 'Escribir en el portapapeles',
    clipboardWrite_help:
      'Este permiso es necesario cuando se utilizan los menús de la barra de títulos para copiar texto de origen/destino del traductor automático.'
  },

  unsupportedFeatures: {
    ff: 'La característica "{{feature}}" no es compatible con Firefox.'
  }
}
