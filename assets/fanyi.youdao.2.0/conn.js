if (!this.JSON) {
  this.JSON = {};
}
/**
* JSON 解析库
*/
(function() {
  function f(n) {
      return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {
      Date.prototype.toJSON = function(key) {
          return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
                  f(this.getUTCMonth() + 1) + '-' +
                  f(this.getUTCDate()) + 'T' +
                  f(this.getUTCHours()) + ':' +
                  f(this.getUTCMinutes()) + ':' +
                  f(this.getUTCSeconds()) + 'Z' : null;
      };
      String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
          return this.valueOf();
      };
  }
  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta = {'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;

  function quote(string) {
      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
          var c = meta[a];
          return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
      var i,k,v,length,mind = gap,partial,value = holder[key];
      if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }
      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }
      switch (typeof value) {case'string':return quote(value);case'number':return isFinite(value) ? String(value) : 'null';case'boolean':case'null':return String(value);case'object':if (!value) {
          return'null';
      }
          gap += indent;partial = [];if (Object.prototype.toString.apply(value) === '[object Array]') {
              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }
              v = partial.length === 0 ? '[]' : gap ? '[\n' + gap +
                      partial.join(',\n' + gap) + '\n' +
                      mind + ']' : '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }
          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  k = rep[i];
                  if (typeof k === 'string') {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {
              for (k in value) {
                  if (Object.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }
          v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                  mind + '}' : '{' + partial.join(',') + '}';gap = mind;return v;
      }
  }

  if (typeof JSON.stringify !== 'function') {
      JSON.stringify = function(value, replacer, space) {
          var i;
          gap = '';
          indent = '';
          if (typeof space === 'number') {
              for (i = 0; i < space; i += 1) {
                  indent += ' ';
              }
          } else if (typeof space === 'string') {
              indent = space;
          }
          rep = replacer;
          if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
              throw new Error('JSON.stringify');
          }
          return str('', {'':value});
      };
  }
  if (typeof JSON.parse !== 'function') {
      JSON.parse = function(text, reviver) {
          var j;

          function walk(holder, key) {
              var k,v,value = holder[key];
              if (value && typeof value === 'object') {
                  for (k in value) {
                      if (Object.hasOwnProperty.call(value, k)) {
                          v = walk(value, k);
                          if (v !== undefined) {
                              value[k] = v;
                          } else {
                              delete value[k];
                          }
                      }
                  }
              }
              return reviver.call(holder, key, value);
          }

          text = String(text);
          cx.lastIndex = 0;
          if (cx.test(text)) {
              text = text.replace(cx, function(a) {
                  return'\\u' +
                          ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
              });
          }
          if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
              j = eval('(' + text + ')');
              return typeof reviver === 'function' ? walk({'':j}, '') : j;
          }
          throw new SyntaxError('JSON.parse');
      };
  }
}());

window.onload = function() {
  var BACKFLAG = 'dataBack';

  /**
   * 事件绑定
   * @param object 要绑定事件的对象
   * @param eventName 事件名称
   * @param callback 事件处理函数
   */
  var bind = function(object, eventName, callback) {
      if (!callback) {
          return;
      }
      if (object.addEventListener) {
          object.addEventListener(eventName, callback, false);
      } else if (object.attachEvent) {
          object.attachEvent('on' + eventName, callback);
      } else {
          object['on' + eventName] = callback;
      }
      return this;
  };
  /**
   * 判断对象是否函数
   * @param obj 待检查对象
   */
  var isFunction = function(obj) {
      return !!(Object.prototype.toString.call(obj) === "[object Function]");
  };
  /**
   * 跨域通信响应对象
   */
  var Response = {
      /**
       * 响应请求信息
       * @param callback
       */
      onMessage:function(callback) {
          if (!isFunction(callback)) {
              callback = function() {
              };
          }
          bind(window, 'message', function(eve) {
              callback(eve);
          });
      },
      /**
       * 向另一个域发送请求
       * @param responseData
       */
      sendMessage : function(responseData) {
          parent.postMessage(JSON.stringify(responseData), '*');
      }
  };
  /**
   * 本地存储。 所有本地存储相关数据存储到 youdao 的域下，这样才能做到用户设置与域无关。
   * @param key 键
   * @param value 值
   */
  var storage = function(key, value) {
      /**
       * html5 中的本地存储方式
       * @param key
       * @param value
       */
      var html5LocalStorage = function(key, value) {
          var store = window.localStorage;
          if (value === undefined) {
              return store.getItem(key);
          }
          if (key !== undefined && value !== undefined) {
              store.setItem(key, value);
              return value;
          }
      };
      /**
       * IE 本地存储方式 userData
       * @param key
       * @param value
       */
      var userdata = function(key, value) {
          var store = document.documentElement;
          store.addBehavior("#default#userData");
          if (value === undefined) {
              store.load("fanyiweb2");
              return store.getAttribute(key);
          }
          if (key !== undefined && value !== undefined) {
              store.setAttribute(key, value);
              store.save("fanyiweb2");
              return value;
          }
      };
      if (!!window.localStorage) {
          return html5LocalStorage(key, value);
      }
      if (!!document.documentElement.addBehavior) {
          return userdata(key, value);
      }
  };

  /**
   * 创建 Ajax 对象
   */
  function createXMLHttpObject() {
      var XHRFactory = [
              function () {
                  return new XMLHttpRequest();
              },
              function () {
                  return new ActiveXObject('Msxml2.XMLHTTP');
              },
              function () {
                  return new ActiveXObject('Msxml3.XMLHTTP');
              },
              function () {
                  return new ActiveXObject('Microsoft.XMLHTTP');
              }
      ];
      var xhr = false;
      for (var i = 0; i < XHRFactory.length; i++) {
          try {
              xhr = XHRFactory[i]();
          } catch(e) {
              continue;
          }
          break;
      }
      return xhr;
  }

  /**
   * 处理跨域请求
   */
  var handleMessage = function() {
      /**
       * 将 request 中的 data 转为对象
       * @param request
       */
      var initData = function(request) {
          var dataArray = request.data,data = {};
          if (typeof dataArray === 'string') {
              dataArray = dataArray.split('&');
          }

          for (var i = 0; i < dataArray.length; i++) {
              var d = dataArray[i].split('=');
              data[d[0]] = d[1];
          }
          return data;
      };
      /**
       * 所有请求的处理函数，请求的处理函数与 request.handler 属性值应保持一致
       */
      var handlers = {
          /**
           * 获取翻译的查询结果
           * @param request 请求数据
           */
          translate : function(request) {
              browser.runtime.sendMessage({ type: 'YOUDAO_TRANSLATE_AJAX', payload: request })
                .then(response => {
                  Response.sendMessage({
                    ...response,
                    'handler': BACKFLAG,
                  })
                })
              // var xhr = createXMLHttpObject();
              // xhr.onreadystatechange = function(event) {
              //     if (xhr.readyState == 4) {
              //         var data = xhr.status == 200 ? xhr.responseText : null;
              //         Response.sendMessage({
              //             'handler': BACKFLAG,
              //             'response': data,
              //             'index': request.index
              //         });
              //     }
              // };
              // xhr.open(request.type, request.url, true);

              // if (request.type === 'POST') {
              //     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              //     xhr.send(request.data);
              // } else {
              //     xhr.send(null);
              // }
          },
          /**
           * 本地存储
           * @param request 请求信息
           */
          localStorage:function(request) {
              var data = initData(request);
              var result = decodeURIComponent(storage(data.key, data.value));
              Response.sendMessage({
                  'handler': BACKFLAG,
                  'response': result,
                  'index': request.index
              });
          }
      };
      return function(request) {
          if (!!!handlers[request.handler]) {
              throw new Error('类别为 ' + request.handler + ' 跨域请求处理函数不存在！');
          }
          handlers[request.handler](request);
      };
  }();
  /**
   * 注册消息处理机制
   */
  Response.onMessage(function(eve) {
      handleMessage(JSON.parse(eve.data));
  });

  Response.sendMessage({handler:'transferStationReady'});
}
