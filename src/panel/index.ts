import './panel.scss'

const req = require['context']('@/components/dictionaries', true, /\.scss$/)
req.keys().forEach(req)
