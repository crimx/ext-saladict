<template>
<section>
  <div class="urban-result" v-if="result">
    <div class="urban-item" v-for="def in result">
      <div class="urban-title">
        <strong>{{ def.title }}</strong>
        <speaker v-if="def.pron" :src="def.pron"></speaker>
      </div>
      <div class="meaning" v-if="def.meaning">{{ def.meaning }}</div>
      <div class="example" v-if="def.example">{{ def.example }}</div>
      <div class="tags" v-if="def.tags">
        <a class="tags-item" v-for="tag in def.tags" :href="`http://www.urbandictionary.com/tags.php?tag=${tag}`">#{{ tag }}</a>
      </div>
      <footer class="footer">
        <span class="contributor">{{ def.contributor }}</span>
        <span class="thumbs" v-if="def.thumbsUp">
          <svg class="icon-thumbs-up" xmlns="http://www.w3.org/2000/svg" width="0.9em" height="0.9em" fill="#666" viewBox="0 0 561 561">
            <path d="M0 535.5h102v-306H0v306zM561 255c0-28.05-22.95-51-51-51H349.35l25.5-117.3v-7.65c0-10.2-5.1-20.4-10.2-28.05L336.6 25.5 168.3 193.8c-10.2 7.65-15.3 20.4-15.3 35.7v255c0 28.05 22.95 51 51 51h229.5c20.4 0 38.25-12.75 45.9-30.6l76.5-181.05c2.55-5.1 2.55-12.75 2.55-17.85v-51H561c0 2.55 0 0 0 0z"/>
          </svg>
          {{ def.thumbsUp }}
        </span>
        <span class="thumbs" v-if="def.thumbsDown">
          <svg class="icon-thumbs-down" xmlns="http://www.w3.org/2000/svg" width="0.95em" height="0.95em" fill="#666" viewBox="0 0 561 561">
            <path d="M357 25.5H127.5c-20.4 0-38.25 12.75-45.9 30.6L5.1 237.15C2.55 242.25 0 247.35 0 255v51c0 28.05 22.95 51 51 51h160.65l-25.5 117.3v7.65c0 10.2 5.1 20.4 10.2 28.05l28.05 25.5 168.3-168.3c10.2-10.2 15.3-22.95 15.3-35.7v-255c0-28.05-22.95-51-51-51zm102 0v306h102v-306H459z"/>
          </svg>
          {{ def.thumbsDown }}
        </span>
      </footer>
    </div>
  </div>
</section>
</template>

<script>
import Speaker from '../Speaker'

export default {
  name: 'Urban',
  props: ['result'],
  components: {
    Speaker
  }
}
</script>

<style lang="scss" scoped>
.urban-result {
  padding: 10px;
}

.urban-item {
  margin-bottom: 10px;
}

.meaning {
  margin-bottom: 5px;
}

.example {
  margin-bottom: 5px;
  padding-left: 5px;
  border-left: 2px solid #666;
}

.tags-item {
  margin-right: 0.5em;
  text-decoration: none;
  color: #16a085;
}

.footer {
  color: #666;
}

.contributor {
  margin-right: 1em;
}

.thumbs {
  margin-right: 5px;
}

.icon-thumbs-up {
  width: 0.9em;
  height: 0.9em;
  fill: #666;
}

.icon-thumbs-down {
  width: 0.95em;
  height: 0.95em;
  fill: #666;
  vertical-align: middle;
}
</style>
