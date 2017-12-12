<template>
  <ul class="social-media__body">
    <li class="social-media__icon" v-for="media in socialMedia">
      <a :href="media.url" :title="media.title" target="_blank" rel="noopener"></a>
      <svg>
        <use :xlink:href="'./assets/symbol-defs.svg#' + media.icon" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
      </svg>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'social-media',
  data () {
    return {
      isShowSocial: false,
      socialMedia: [{
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
        url: 'https://music.163.com/djradio/3480003'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.social-media__body {
  display: flex;
  padding: 8px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 3px 4px 31px -8px rgba(0,0,0,0.8);
}

.social-media__icon {
  position: relative;
  width: 42px;
  height: 42px;
  margin: 5px;
  list-style-type: none;

  svg {
    max-width: 100%;
    max-height: 100%;
  }

  a {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 50%;

    &:hover {
      background: rgba(0,0,0,.1)
    }
  }
}
</style>
