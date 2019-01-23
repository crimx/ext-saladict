import React from 'react'

import './_style.scss'

const socialMedia = [{
  title: 'email',
  icon: 'icon-mail-circle',
  url: 'mailto:straybugs@gmail.com'
}, {
  title: '豆瓣',
  icon: 'icon-douban-circle',
  url: 'https://www.douban.com/people/jaward'
}, {
  title: '网易云音乐',
  icon: 'icon-netease-music-circle',
  url: 'https://music.163.com/#/user/home?id=44711994'
}, {
  title: '知乎',
  icon: 'icon-zhihu-circle',
  url: 'https://www.zhihu.com/people/straybugs/answers'
}, {
  title: '微博',
  icon: 'icon-weibo-circle',
  url: 'https://www.weibo.com/bananajaward'
}, {
  title: 'Github',
  icon: 'icon-github-circle',
  url: 'https://github.com/crimx'
}]

export const SocialMedia = () => (
  <ul className='social-media__body'>
    {socialMedia.map(media => (
      <li key={media.title} className='social-media__icon'>
        <a href={media.url} title={media.title} target='_blank' rel='noopener'></a>
        <svg>
          <use
            xlinkHref={require('@/assets/symbol-defs.svg') + '#' + media.icon}
            xmlnsXlink='http://www.w3.org/1999/xlink'
          ></use>
        </svg>
      </li>
    ))}
  </ul>
)

export default SocialMedia
