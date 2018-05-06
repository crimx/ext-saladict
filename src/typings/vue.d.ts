/**
 * Extends interfaces in Vue.js
 */

import Vue, { ComponentOptions } from "vue";

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    store?: any;
    i18n?: any;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $store: any;
    $i18n?: any;
  }
}
