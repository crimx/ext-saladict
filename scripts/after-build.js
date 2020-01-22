const fs = require('fs-extra')
const path = require('path')

// FF policy
fs.remove(path.join(__dirname, '../build/firefox/assets/fanyi.youdao.2.0'))
