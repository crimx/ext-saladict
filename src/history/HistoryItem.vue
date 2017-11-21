<template functional>
  <div class="row">
    <div class="col-sm-6 text-right">
      <p class="history-item-title">{{ props.item.localeDate }}</p>
    </div>
    <div class="col-sm-6">
      <table class="table table-hover table-striped word-table">
        <tbody>
          <tr v-for="(word, i) in props.item.data" :key="i">
            <td class="text-center">{{ word }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
