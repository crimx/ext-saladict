module.exports = () => ({
  plugins: [
    require('autoprefixer')({
      browsers: ['Chrome >= 55', 'Firefox >= 56']
    })
  ]
})
