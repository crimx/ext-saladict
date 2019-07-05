;(function () {
  const $script = document.createElement('script');
  $script.type = 'text/javascript';
  $script.charset = 'UTF-8';
  $script.text = `
;(function (){
  if (typeof google === 'undefined') {
    window.google = {};
  }

  if (google.translate == null) {
    google.translate = {};
  }

  if (google.translate._const == null) {
    google.translate._const = {};
  }

  const c = google.translate._const;

  c._cest = new Date();
  c._cl = '';
  c._cuc = 'googleTranslateElementInit';
  c._cac = '';
  c._cam = '';
  c._ctkk = '423865.2095111048';
  c._pas = (window.location.protocol === 'http:' ? 'http' : 'https') + '://';
  c._pah = 'translate.googleapis.com';
  const b = c._pas + c._pah;
  c._pbi = b + '/translate_static/img/te_bk.gif';
  c._pci = b + '/translate_static/img/te_ctrl3.gif';
  c._pli = b + '/translate_static/img/loading.gif';
  c._plla = c._pah + '/translate_a/l';
  c._pmi = b + '/translate_static/img/mini_google.png';
  c._ps = b + '/translate_static/css/translateelement.css';
  c._puh = 'translate.google.com';

  const $trans = document.createElement('div');
  $trans.id = 'google_translate_element';

  const $css = document.createElement('link');
  $css.type = 'text/css';
  $css.rel = 'stylesheet';
  $css.charset = 'UTF-8';
  $css.href = c._ps;

  const $main = document.createElement('script');
  $main.type = 'text/javascript';
  $main.charset = 'UTF-8';
  $main.src = b + '/translate_static/js/element/main.js';
  $main.onerror = function () {
    alert(
      '无法在此网页加载谷歌网页翻译组件，可能是网络问题或者此网站禁止加载外部脚本。\\n' +
      'Unable to load google page translation script. Could be network issue or script being blocked by the website.'
    )
  };

  function googleTranslateElementInit (){
    new google.translate.TranslateElement({
      pageLanguage: 'auto'
    },'google_translate_element');
  }

  window.googleTranslateElementInit = googleTranslateElementInit;

  document.body.insertBefore($trans, document.body.firstChild);
  ;(document.head || document.body).appendChild($css);
  ;(document.head || document.body).appendChild($main);
}());
  `;

  const $style = document.createElement('style');
  $style.innerHTML = `
    #google_translate_element {
      position: relative !important;
    }
    #google_translate_element,
    .goog-te-menu-frame,
    .goog-te-banner-frame {
      z-index: 2147483647 !important;
    }
  `;

  ;(document.head || document.body).appendChild($script);
  ;(document.head || document.body).appendChild($style);
}());
