import '@/panel/index.scss'
import '@/wordeditor'
import '../../selection'
import '../index'

import { AppConfigMutable, TCDirection } from '@/app-config'
import { updateConfig, initConfig } from '@/_helpers/config-manager'
import { updateProfile, initProfiles } from '@/_helpers/profile-manager'
import { ProfileMutable } from '@/app-config/profiles'

const req = require['context']('@/components/dictionaries', true, /\.scss$/)
req.keys().forEach(req)

Promise.all([initConfig(), initProfiles()])
.then(([_config, _profile]) => {
  const config: AppConfigMutable = JSON.parse(JSON.stringify(_config))
  const profile: ProfileMutable = JSON.parse(JSON.stringify(_profile))

  profile.dicts.selected = ['bing', 'google', 'guoyu', 'cobuild', 'liangan']
  profile.dicts.all.bing.defaultUnfold = false
  profile.dicts.all.guoyu.selectionLang.eng = false

  config.mode.double = true
  // config.mode.icon = false
  // config.animation = false
  config.panelMode.double = true
  config.panelMode.holding.ctrl = true
  config.panelMode.holding.shift = true
  config.panelMode.instant.enable = true
  config.tripleCtrlAuto = true
  config.tripleCtrlLocation = TCDirection.right
  config.tripleCtrlPreload = 'selection'
  config.pinMode.direct = false
  config.pinMode.double = true
  config.pinMode.holding.ctrl = false

  setTimeout(() => {
    document.body.style.display = 'block'
    document.body.style.background = '#fff'
    const el = document.createElement('div')
    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur, repellendus est? Nulla vel quos minima quaerat dignissimos, quod sunt id ex. Quasi culpa incidunt possimus modi molestias voluptatum, excepturi blanditiis aliquid? Quam sit delectus eius itaque labore, numquam eos. Perspiciatis aliquam, quas vel quaerat voluptatem sunt esse deleniti modi reiciendis. Id mollitia accusantium architecto eum incidunt nostrum, quo adipisci facere sit tempore voluptatem error est non voluptatibus excepturi quae eaque? Adipisci, enim rem. Fugiat quisquam aspernatur possimus, beatae soluta repudiandae autem quod iure sed ullam, id laborum. Nostrum autem error, consequatur ipsam natus repellat dolores quas quidem quia aut eligendi voluptatibus eos delectus non quo, voluptates laudantium temporibus suscipit culpa. Sint debitis, vitae commodi eveniet suscipit error quae ut soluta laborum architecto consequuntur cumque eaque ipsum earum corrupti qui unde quo, fugiat hic quasi reprehenderit obcaecati facere. Omnis dicta molestias magni suscipit vero optio deserunt aut dolore aperiam possimus dolores illum, cupiditate laborum? Earum non maxime sit esse recusandae, qui necessitatibus deserunt ad minima ducimus sequi eos, quam ab repellendus laudantium quod cumque dolores labore voluptate dicta ipsa voluptas omnis quibusdam! Id consequatur blanditiis fuga magnam dolores, dicta optio quisquam consectetur odit commodi enim exercitationem beatae saepe obcaecati ipsam tenetur accusamus debitis. Omnis et cupiditate temporibus sunt nesciunt repellat blanditiis cum adipisci impedit. Et, distinctio tempora ipsam sapiente error mollitia neque labore quod nesciunt dicta amet voluptatem veniam ut soluta earum iure praesentium facere unde reiciendis accusantium voluptatum. Amet corrupti aperiam qui vel nemo mollitia nisi aliquam recusandae aspernatur quae error optio eveniet ipsum, iusto repellendus? Eum nobis maxime magni modi debitis tempora, rem obcaecati eaque nihil consequatur, tenetur accusantium blanditiis incidunt possimus sequi similique quae voluptas harum, aperiam dolore dicta nesciunt corrupti. Deleniti, sit repellat? Aliquid, atque perspiciatis placeat velit est, totam id dolorem fuga quas odit, voluptatem minima?'
    el.textContent = text + text + text + text
    document.body.appendChild(el)
    updateConfig(config)
    updateProfile(profile)
  }, 100)
})
