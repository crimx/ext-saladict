'use strict'

module.exports = {
  process(src) {
    return `
      module.exports = {
        __esModule: true,
        default: ${JSON.stringify(src)},
      };
    `
  }
}
