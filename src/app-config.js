var config = () => {
  const allDicts = {
    wordreference: {
      name: 'wordreference'
    },
    bing: {
      name: 'bing'
    },
    iciba: {
      name: 'iciba'
    },
    urban: {
      name: 'urban'
    },
    vocabulary: {
      name: 'vocabulary'
    },
    dictcn: {
      name: 'dictcn'
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
