/**
 * Intercept ajax calls and return fake data
 * You can use libraries like 'mork-fetch', 'faker'
 */

import _ from 'lodash'

const fakeXHRData = [
  {
    test: { url: /www\.hjdict\.com.*love$/ },
    response: {
      status: 200,
      response: require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/love.html')
    },
  },
  {
    test: { url: /www\.hjdict\.com.*henr$/ },
    response: {
      status: 200,
      response: require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/henr.html')
    },
  },
  {
    test: { url: /www\.hjdict\.com.*爱$/ },
    response: {
      status: 200,
      response: require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/爱.html')
    },
  },
]

const fakeFetchData = [
  {
    test: { url: /dict\.cnki\.net.*love$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cnki/response/love.html')],
  },
  {
    test: { url: /www\.collinsdictionary\.com/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cobuild/response/how.html')],
  },
  {
    test: { url: /ja\.dict\.naver\.com.*愛$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/naver/response/愛.html')],
  },
  {
    test: { url: /m\.cndic\.naver\.com.*爱$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/naver/response/爱.html')],
  },
  {
    test: { url: /www\.hjdict\.com.*love$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/love.html')],
  },
  {
    test: { url: /www\.hjdict\.com.*henr$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/henr.html')],
  },
  {
    test: { url: /www\.hjdict\.com.*爱$/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/hjdict/response/爱.html')],
  },
  {
    test: { url: /m\.wikipedia\.org\/wiki\/数字/ },
    response: [require('raw-loader!../../test/specs/components/dictionaries/wikipedia/response/数字.html')],
  },
  {
    test: { url: /dict\.youdao.com\/suggest.*q=love/ },
    response: [`{"result":{"code":200,"msg":"success"},"data":{"query":"love","entries":[{"explain":"n. 恋爱; 亲爱的; 酷爱; 喜爱的事物; vt. 喜欢; 热爱; 爱慕; vi. 爱; n. (...","entry":"love"},{"explain":"adj. 可爱的; 令人愉快的; n. (Lovely)人名; (英)洛夫利","entry":"lovely"},{"explain":"n. 爱人，恋人; 爱好者; n. (Lover)人名; (英)洛弗","entry":"lover"},{"explain":"n. 可爱; 漂亮; 魅力; 美好","entry":"loveliness"},{"explain":"v. 热爱（love的过去分词）; adj. 恋爱的; 受珍爱的","entry":"loved"},{"explain":"n. 情人（lover的复数形式）","entry":"lovers"},{"explain":"adj. 害相思病的; 苦恋的","entry":"lovesick"},{"explain":"可爱的; 优美的; 令人愉快的; 亲切友好的（lovely的最高级）","entry":"loveliest"},{"explain":"爱情","entry":"loves"},{"explain":"adj. 失恋的; 害相思病的","entry":"lovelorn"},{"explain":"爱你（歌曲名）","entry":"love you"},{"explain":"风流韵事; 强烈爱好","entry":"love affair"},{"explain":"情书","entry":"love letter"},{"explain":"n. 爱情故事，恋爱小说","entry":"love story"},{"explain":"深爱","entry":"love dearly"},{"explain":"永恒的爱（歌曲名）","entry":"love forever"},{"explain":"n. 爱情生活","entry":"love life"},{"explain":"爱是忧郁（等于蓝色的爱，歌曲名）","entry":"love is blue"},{"explain":"无头东宫（电视剧名）","entry":"love is beautiful"},{"explain":"温柔地爱我（歌名）","entry":"love me tender"},{"explain":"爱情使人盲目; 情人眼里出西施","entry":"love is blind"}],"language":"en"}}`],
  },
  {
    test: { url: /dict\.youdao.com\/suggest/ },
    response: [`{"result":{"code":200,"msg":"success"},"data":{"query":"text","entries":[{"explain":"n. [计] 文本; 课文; 主题; vt. 发短信","entry":"text"},{"explain":"n. 质地; 纹理; 结构; 本质，实质","entry":"texture"},{"explain":"n. 纺织品，织物; adj. 纺织的","entry":"textile"},{"explain":"n. 教科书，课本","entry":"textbook"},{"explain":"<b>Texting</b> is the same as . 发短信","entry":"texting"},{"explain":"adj. 本文的; 按原文的","entry":"textual"},{"explain":"n. 纺织品; [纺] 纺织业; 纺织面料; 纺织品类（textile的复数）","entry":"textiles"},{"explain":"n. 文本框; 文本域; 文本字段","entry":"textfield"},{"explain":"adj. 有织纹的; 手摸时有感觉的; 具有特定结构的; 特征显著的; v. 使具有某种结构（tex...","entry":"textured"},{"explain":"n. 课文，文字（text复数形式）","entry":"texts"},{"explain":"n. 纹理; 材质（texture的复数）; v. 使具有某种结构（texture的三单形式）","entry":"textures"},{"explain":"n. 教科书; 课本（textbook的复数）","entry":"textbooks"},{"explain":"n. 文本框","entry":"textbox"},{"explain":"adj. 组织的; 结构的","entry":"textural"},{"explain":"文字样式; 文本样式","entry":"text style"},{"explain":"纺织工业","entry":"textile industry"},{"explain":"文字讯息，正文消息","entry":"text message"},{"explain":"纺织厂","entry":"textile mill"},{"explain":"纹理映射; 纹理贴图; 材质贴图; 贴图坐标","entry":"texture mapping"},{"explain":"文字编辑器，文本编辑器","entry":"text editor"},{"explain":"文转声; 语音合成; 文本转语音","entry":"text to speech"}],"language":"en"}}`],
  },
  {
    test: { url: /bing\.com/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/bing/response/lex.html')],
  },
  {
    test: { url: /\.iciba\.com/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cobuild/response/love.html')],
  },
  {
    test: { url: /\.etymonline\.com\/search/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/etymonline/response/love.html')],
  },
  {
    test: { url: /\.etymonline\.com\/word/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/etymonline/response/love-word.html')],
  },
  {
    test: { url: /translate\.google(apis)?\.(com|cn)/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/google/response/f.txt')],
  },
  {
    test: { url: /www\.google\.com\/.*love/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/googledict/response/en-love.html')],
  },
  {
    test: { url: /www\.google\.com\/.*爱/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/googledict/response/chs-爱.html')],
  },
  {
    test: { url: /www\.google\.com\/.*mouse/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/googledict/response/chs-mouse.html')],
  },
  {
    test: { url: /moedict\.tw/, },
    response: [JSON.parse(require('raw-loader!../../test/specs/components/dictionaries/guoyu/response/愛.json'))],
  },
  {
    test: { url: /urbandictionary\.com/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/urban/response/test.html')],
  },
  {
    test: { url: /eudic\.net.*tab-detail/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/eudic/response/sentences.html')],
  },
  {
    test: { url: /eudic\.net/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/eudic/response/love.html')],
  },
  {
    test: { url: /zdic\.net.*爱/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/zdic/response/爱.html')],
  },
  {
    test: { url: /zdic\.net.*沙拉/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/zdic/response/沙拉.html')],
  },
  {
    test: { url: /vocabulary\.com/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/vocabulary/response/love.html')],
  },
  {
    test: { url: /macmillandictionary\.com.*love$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/love.html')],
  },
  {
    test: { url: /macmillandictionary\.com.*love_2$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/love_2.html')],
  },
  {
    test: { url: /macmillandictionary\.com.*jumblish$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/jumblish.html')],
  },
  {
    test: { url: /ldoceonline\.com.*love$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/longman/response/love.html')],
  },
  {
    test: { url: /ldoceonline\.com.*profit$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/longman/response/profit.html')],
  },
  {
    test: { url: /ldoceonline\.com.*jumblish$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/longman/response/jumblish.html')],
  },
  {
    test: { url: /youdao\.com.*jumblish$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/youdao/response/jumblish.html')],
  },
  {
    test: { url: /youdao\.com.*love$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/youdao/response/love.html')],
  },
  {
    test: { url: /youdao\.com.*translation$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/youdao/response/translation.html')],
  },
  {
    test: { url: /learnersdictionary\.com.*house$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/house.html')],
  },
  {
    test: { url: /learnersdictionary\.com.*door$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/door.html')],
  },
  {
    test: { url: /learnersdictionary\.com.*jumblish$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/jumblish.html')],
  },
  {
    test: { url: /oxfordlearnersdictionaries\.com.*love$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/oald/response/love.html')],
  },
  {
    test: { url: /oxfordlearnersdictionaries\.com.*love_2$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/oald/response/love_2.html')],
  },
  {
    test: { url: /oxfordlearnersdictionaries\.com.*jumblish$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/oald/response/jumblish.html')],
  },
  {
    test: { url: /cambridge\.org.*love$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/love.html')],
  },
  {
    test: { url: /cambridge\.org.*catch$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/catch-zht.html')],
  },
  {
    test: { url: /cambridge\.org.*house$/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/house-zhs.html')],
  },
  {
    test: { url: /weblio\.jp.*love/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/weblio/response/love.html')],
  },
  {
    test: { url: /weblio\.jp.*吐く/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/weblio/response/吐く.html')],
  },
  {
    test: { url: /weblio\.jp.*当たる/, },
    response: [require('raw-loader!../../test/specs/components/dictionaries/weblio/response/当たる.html')],
  },
]

/*-----------------------------------------------*\
    Fake fetch
\*-----------------------------------------------*/
const fetch = window.fetch

window.fetch = async (url, ...args) => {
  const data = fakeFetchData.find(data => {
    return (!data.test.method || data.test.method.test(method)) && data.test.url.test(decodeURI(url))
  })

  if (data) {
    if (data.error) {
      return Promise.reject(data.error)
    } else {
      // return Promise.resolve(data.response)
      let delay = window['FAKE_AJAX_DELAY']
      if (typeof delay === 'undefined') {
        delay = Math.random() * 1000
      }
      await new Promise(resolve => setTimeout(resolve, delay))
      return new Response(...data.response)
    }
  }

  return fetch(url, ...args)
}

/*-----------------------------------------------*\
    Fake XHR
\*-----------------------------------------------*/

const XMLHttpRequest = window.XMLHttpRequest
window.XMLHttpRequest = FakeXMLHttpRequest

function FakeXMLHttpRequest (...args) {
  return new Proxy(new XMLHttpRequest(...args), {
    get (target, propKey) {
      if (propKey === 'open') {
        return function (method, url) {
          const data = fakeXHRData.find(data => {
            return (!data.test.method || data.test.method.test(method)) && data.test.url.test(url)
          })

          if (data) {
            target.__dictData = data
          } else {
            return target.open(method, url)
          }
        }
      }

      if (propKey === 'send') {
        return function (...args) {
          if (target.__dictData) {
            const data = target.__dictData

            if (data.error) {
              target.onerror && target.onerror(new Error(data.error))
              return
            }

            if (target.onload) {
              // target.onload()
              let delay = window['FAKE_AJAX_DELAY'] || 1000
              setTimeout(() => {
                _.set(target, '__dictData.response.readyState', target.DONE)
                console.log(target.__dictData)
                target.onload()
              }, delay);
            }
          } else {
            return target.send(...args)
          }
        }
      }

      const val = _.get(target, `__dictData.response.${propKey}`)
      if (val !== undefined) {
        return val
      }

      return target[propKey]
    },
    set (target, propKey, value) {
      target[propKey] = value
      if (propKey === 'responseType' && value === 'document') {
        const res = _.get(target, '__dictData.response.response')
        const responseXML = res
          ? new DOMParser().parseFromString(
            target.__dictData.response.response,
            'text/html',
          )
          : null
        _.set(target, '__dictData.response.responseXML', responseXML)
      }
      return true
    }
  })
}
