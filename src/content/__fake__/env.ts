import faker from 'faker'
import '@/selection'
import { initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'

browser.runtime.sendMessage['_sender'].callsFake(() => ({
  tab: {
    id: 'saladict-page'
  }
}))

initConfig()
initProfiles()

for (let i = 0; i < 10; i++) {
  const $p = document.createElement('p')
  $p.innerHTML = 'love ' + faker.lorem.paragraph()
  document.body.appendChild($p)
}
