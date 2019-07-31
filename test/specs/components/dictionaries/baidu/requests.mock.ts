import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['I love you']

export const mockRequest: MockRequest = mock => {
  mock.onGet('https://fanyi.baidu.com').reply(
    200,
    `
    <script>window.bdstoken = 'fe2823b14dc96f85d65ff1b9b878e7d6';window.gtk = '321305.131321201';</script>
    <script>
    window['common'] = {
        token: '345a13cb83ca26130e48d7a846624f6f',
        systime: '1564575692931',
        logid: '3d970e492093c125d506a723e8594f43'
    }</script>
    `
  )

  mock.onPost('https://fanyi.baidu.com/v2transapi').reply(200, {
    trans_result: {
      data: [
        {
          dst: '我爱你',
          prefixWrap: 0,
          result: [[0, '我爱你', ['0|10'], [], ['0|10'], ['0|9']]],
          src: 'I love you'
        }
      ],
      from: 'en',
      status: 0,
      to: 'zh',
      type: 2,
      phonetic: [
        { src_str: '我', trg_str: 'wǒ' },
        { src_str: '爱', trg_str: 'ài' },
        { src_str: '你', trg_str: 'nǐ' }
      ]
    },
    dict_result: {
      edict: '',
      zdict: '',
      from: 'original',
      simple_means: {
        symbols: [
          {
            ph_en: 'aɪ lʌv ju',
            ph_am: 'aɪ lʌv jə',
            parts: [{ part: '', means: ['我爱你'] }],
            ph_other: 'ai lʌv ju:'
          }
        ],
        word_name: 'I love you',
        from: 'original',
        word_means: ['我爱你']
      },
      lang: '1'
    },
    logid: 2288849301
  })
}
