import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['test']

const html = `
  <div
    class="dictentry"
    data-type-block="definition.title.type.cobuild"
    data-title-block="definition.title.type.cobuild"
    data-num-block="1"
  >
    <span class="pron">
      <a class="audio_play_button" data-src-mp3="https://example.com/uk.mp3"></a>
    </span>
    <div class="def">definition</div>
  </div>
  <div
    class="dictentry"
    data-type-block="definition.title.type.ced"
    data-title-block=""
    data-num-block="2"
  >
    <span class="pron">
      <a class="audio_play_button" data-src-mp3="https://example.com/ced.mp3"></a>
    </span>
    <div class="def">ced definition</div>
  </div>
  <div
    class="dictentry"
    data-type-block="definition.title.type.penguin"
    data-title-block=""
    data-num-block="3"
  >
    <div class="def">penguin definition</div>
  </div>
  <div
    class="dictentry"
    data-type-block="definition.title.type.examples"
    data-title-block=""
    data-num-block=""
  >
    <div class="quote">example sentence</div>
  </div>
  <div
    class="dictentry"
    data-type-block="Video pronunciation"
    data-title-block=""
    data-num-block=""
  >
    <div class="video">video</div>
  </div>
  <div
    class="dictentry"
    data-type-block="Word lists"
    data-title-block=""
    data-num-block=""
  >
    <div>word list</div>
  </div>
  <div
    class="dictentry"
    data-type-block="definition.title.type.esp_ret"
    data-title-block=""
    data-num-block=""
  >
    <div class="def">retail definition</div>
  </div>
  <div
    class="dictentry"
    data-type-block="Word usage trends"
    data-title-block=""
    data-num-block=""
  >
    <div>trend</div>
  </div>
  <div
    class="dictentry"
    data-type-block="Translations of &lt;b&gt;{0}&lt;/b&gt;"
    data-title-block=""
    data-num-block=""
  >
    <div>translation</div>
  </div>
  <div class="entry dictionary cB cB-i">
    <div
      class="cB-h"
      data-type-block="definition.title.type.idioms"
      data-title-block=""
      data-num-block=""
    >
      <h2 class="entry_title">More idioms containing <div class="h2_entry">pick</div></h2>
    </div>
    <div class="asset IdiomList assetlink">
      <a class="xr ref">pick holes in something</a>
    </div>
  </div>
  <div class="entry dictionary cB cB-rel-t">
    <div
      class="cB-h"
      data-type-block="definition.title.type.collos"
      data-title-block=""
      data-num-block=""
    >
      <h2 class="entry_title">COBUILD Collocations <div class="h2_entry">pick</div></h2>
    </div>
    <div class="asset ColloList assetlink">
      <a class="xr ref">pick a favorite</a>
    </div>
  </div>
`

export const mockRequest: MockRequest = mock => {
  mock.onGet(/collinsdictionary\.com.*\/verify/).reply(403)

  mock.onGet(/collinsdictionary\.com\/zh/).reply(200, html)

  mock.onGet(/collinsdictionary/).reply(200, html)
}
