<template>
  <transition name="fade">
    <div class="modal show text-left" v-if="title || content">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" v-if="title">
            <button type="button" class="close" @click="handleCancel">&times;</button>
            <h4 class="modal-title">{{ title }}</h4>
          </div>
          <div class="modal-body" v-if="content">
            <p>{{ content }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" @click="handleCancel">{{ i18n('cancel') }}</button>
            <button type="button" class="btn btn-danger" @click="handleConfirm">{{ i18n('confirm') }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
      title: '',
      content: '',
      onConfirm: null,
      onCancel: null
    }
  },
  methods: {
    i18n (key) {
      return chrome.i18n.getMessage(key)
    },
    handleConfirm () {
      if (typeof this.onConfirm === 'function') {
        this.onConfirm()
        this.onConfirm = null
      }
      this.title = ''
      this.content = ''
    },
    handleCancel () {
      if (typeof this.onCancel === 'function') {
        this.onCancel()
        this.onCancel = null
      }
      this.title = ''
      this.content = ''
    }
  },
  created () {
    this.$on('show', ({title, content, onConfirm, onCancel}) => {
      this.title = title
      this.content = content
      this.onConfirm = onConfirm
      this.onCancel = onCancel
    })
  }
}
</script>


<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>

