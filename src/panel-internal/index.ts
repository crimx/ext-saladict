import './panel-internal.scss'

const req = require['context']('@/components/dictionaries', true, /\.scss$/)
req.keys().forEach(req)
