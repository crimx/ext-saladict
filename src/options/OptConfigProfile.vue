<template>
  <div class="opt-item"><!-- 情景模式 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:config_profile_title') }}</strong>
    </div>
    <div class="opt-item__body opt-config-profile-body">
      <div class="select-box-container">
        <label class="select-box">
          <select class="form-control" v-model="activeConfigID">
            <option
              v-for="id in configProfileIDs"
              :value="id"
              :selected="id === activeConfigID"
            >{{ profileText(id) }}</option>
          </select>
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:config_profile_description')"></p>
    </div>
  </div><!-- 情景模式 -->
</template>

<script>
export default {
  store: ['configProfileIDs', 'configProfiles', 'activeConfigID'],
  methods: {
    profileText (id) {
      const name = this.configProfiles[id].name

      // default names
      const match = /^%%_(\S+)_%%$/.exec(name)
      if (match) {
        return this.$t(`profile:${match[1]}`) || name
      }

      return name
    }
  },
}
</script>

<style>
.opt-config-profile-body {
  display: flex;
  justify-content: center;
  border: 1px solid #FDE3A7;
  background: #fffec8;
}
</style>

