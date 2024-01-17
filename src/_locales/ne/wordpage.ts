import { locale as _locale } from '../zh-CN/wordpage'

export const locale: typeof _locale = {
  title: {
    history: 'सलाडिक्ट खोज इतिहास',
    notebook: 'सलाडिक्ट नोटबुक',
  },

  localonly: 'स्थानीयमा मात्र',

  column: {
    add: 'थप्नुहोस्',
    date: 'मिति',
    edit: 'सम्पादन',
    note: 'टिप्पणी',
    source: 'स्रोत',
    trans: 'अनुवाद',
    word: 'शब्द'
  },

  delete: {
    title: 'मेटाउनुहोस्',
    all: 'सबै मेटाउनुहोस्',
    confirm: '. साच्चै ?',
    page: 'पृष्ठ मेटाउनुहोस्',
    selected: 'चयन गरिएको मेटाउनुहोस्'
  },

  export: {
    title: 'निर्यात',
    all: 'सबै निर्यात गर्नुहोस्',
    description: 'हरेक रेकर्डको आकार बताउनुहोस्:',
    explain: 'एन्की र अन्य उपकरणमा कसरी निर्यात गर्ने',
    gencontent: 'निर्मित सामग्री',
    linebreak: {
      default: 'पूर्वनिर्धारित लाइनब्रेक राख्नुहोस्',
      n: 'लाइनब्रेकहरूलाई \\n संग स्थानान्तरण गर्नुहोस्',
      br: 'लाइनब्रेकहरूलाई <br> संग स्थानान्तरण गर्नुहोस्',
      p: 'लाइनब्रेकहरूलाई <p> संग स्थानान्तरण गर्नुहोस्',
      space: 'लाइनब्रेकहरूलाई स्पेस संग स्थानान्तरण गर्नुहोस्'
    },
    page: 'पृष्ठ निर्यात गर्नुहोस्',
    placeholder: 'प्लेसहोल्डर',
    htmlescape: {
      title: 'टिप्पणीहरूमा HTML वर्णहरू ऐस्केप गर्नुहोस्',
      text: 'HTML ऐस्केप गर्नुहोस्'
    },
    selected: 'चयन गरिएको निर्यात गर्नुहोस्'
  },

  filterWord: {
    chs: 'चिनियाँ',
    eng: 'अंग्रेजी',
    word: 'शब्द',
    phrase: 'वाक्यांश'
  },

  wordCount: {
    selected: '{{count}} बस्तु चयन गरिएको',
    selected_plural: '{{count}} बस्तुहरु चयन गरिएको',
    total: '{{count}} बस्तु जम्मा',
    total_plural: '{{count}} बस्तुहरु जम्मा'
  }
}
