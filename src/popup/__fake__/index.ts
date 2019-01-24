import './_style.scss'
import { initConfig } from '@/_helpers/config-manager'

initConfig().then(() => {
  require('../index')
})
