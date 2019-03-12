export type Acknowledgement = Array<{
  name: string
  href: string
  locale: string
}>

export const acknowledgement: Acknowledgement = [
  {
    name: 'stockyman',
    href: 'https://github.com/stockyman',
    locale: 'trans_tw',
  },
  {
    name: 'caerlie',
    href: 'https://github.com/caerlie',
    locale: 'weblio',
  },
  {
    name: 'Wekey',
    href: 'https://weibo.com/925515171?is_hot=1',
    locale: 'naver',
  },
  {
    name: 'lwdgit',
    href: 'https://github.com/lwdgit',
    locale: 'shanbay',
  },
]

export default acknowledgement
