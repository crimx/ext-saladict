import '../index'
import './_style.scss'
import { initConfig, updateConfig } from '@/_helpers/config-manager'

async function main() {
  const config = await initConfig()
  await updateConfig({
    ...config,
    darkMode: true
  })
}

main()
