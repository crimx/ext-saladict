import stripScript from '@/_helpers/strip-script'

describe('Strip Script', () => {
  const expectedEl = document.createElement('div') as HTMLDivElement
  expectedEl.innerHTML = `
    <p class="p" id="p">
      <a href="https://e.c/" target="_blank">
        <img src="https://e.c/g.jpg" alt="logo" />
        <span>hello</span>
      </a>
    </p>
  `

  it('should be the same with snaitized element', () => {
    const sanEl = stripScript(expectedEl)
    expect(sanEl).toBeInstanceOf(HTMLElement)
    scanElm(expectedEl, sanEl as HTMLElement)
  })
  it('should remove unsupported properties', () => {
    const div = document.createElement('div') as HTMLDivElement
    div.innerHTML = `
      <p data-c="p" class="p" id="p">
        <a onmouseover="alert" href="https://e.c/" target="_blank">
          <img onload="alert" src="https://e.c/g.jpg" alt="logo" />
          <span color="red">hello</span>
        </a>
      </p>
    `
    const sanEl = stripScript(div)
    expect(sanEl).toBeInstanceOf(HTMLElement)
    scanElm(expectedEl, sanEl as HTMLElement)
  })
  it('should remove unsupported tags', () => {
    const div = document.createElement('div') as HTMLDivElement
    div.innerHTML = `
      <p class="p" id="p">
        <a href="https://e.c/" target="_blank">
          <img src="https://e.c/g.jpg" alt="logo" />
          <span>hello</span>
        </a>
        <script>alert()</script>
        <object></object>
        <iframe src="https://e.c/" />
        <a href="javascript:alert">bad url</a>
        <img src="javascript:alert"/>
      </p>
    `
    const sanEl = stripScript(div)
    expect(sanEl).toBeInstanceOf(HTMLElement)
    scanElm(expectedEl, sanEl as HTMLElement)
  })
})

function scanElm (el1: HTMLElement, el2: HTMLElement): void {
  const attrs1 = el1.attributes
  const attrs2 = el2.attributes
  expect(attrs1.length).toBe(attrs2.length)
  if (attrs1.length > 0) {
    for (let i = 0; i < attrs1.length; i++) {
      expect(attrs1[i].value).toBe(el2.getAttribute(attrs1[i].name))
    }
  }
  const children1 = el1.children
  const children2 = el2.children
  expect(children1.length).toBe(children2.length)
  if (children1.length > 0) {
    for (let i = 0; i < children1.length; i++) {
      scanElm(children1[i] as HTMLElement, children2[i] as HTMLElement)
    }
  }
}
