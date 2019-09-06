export type Acknowledgement = Array<{
  name: string
  href: string
  locale: string
}>

export const acknowledgement: Acknowledgement = [
  {
    name: 'zhtw2013',
    href: 'https://github.com/crimx/ext-saladict/commits?author=zhtw2013',
    locale: 'trans_tw'
  },
  {
    name: 'lwdgit',
    href: 'https://github.com/crimx/ext-saladict/commits?author=lwdgit',
    locale: 'shanbay'
  },
  {
    name: 'Wekey',
    href: 'https://weibo.com/925515171?is_hot=1',
    locale: 'naver'
  },
  {
    name: 'caerlie',
    href: 'https://github.com/caerlie',
    locale: 'weblio'
  },
  {
    name: 'stockyman',
    href: 'https://github.com/stockyman',
    locale: 'trans_tw'
  }
]

export default acknowledgement
