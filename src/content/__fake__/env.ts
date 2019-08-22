import faker from 'faker'

for (let i = 0; i < 10; i++) {
  const $p = document.createElement('p')
  $p.innerHTML = faker.lorem.paragraph()
  document.body.appendChild($p)
}
