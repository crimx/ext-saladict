var config = () => {
  const allDicts = {
    wordreference: {
      id: 'wordreference'
    },
    bing: {
      id: 'bing'
    },
    iciba: {
      id: 'iciba'
    },
    urban: {
      id: 'urban'
    },
    vocabulary: {
      id: 'vocabulary'
    },
    dictcn: {
      id: 'dictcn'
    }
  }

  return {
    active: true,

    // icon: show pop icon first
    // direct: show panel directly
    // ctrl: show panel when double click ctrl + selection not empty
    mode: 'icon',

    // show panel when triple press ctrl
    tripleCtrl: true,

    // default selected dictionaries
    dicts: [
      allDicts.bing,
      allDicts.iciba,
      allDicts.urban,
      allDicts.vocabulary,
      allDicts.dictcn
    ],

    allDicts: allDicts,

    language: {
      chinese: true,
      english: false
    }
  }
}

export default config()
