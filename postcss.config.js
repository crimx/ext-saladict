module.exports = () => ({
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('autoprefixer')({
      browsers: ['Chrome >= 55', 'Firefox >= 56']
    })
  ]
})
