module.exports = {
  files: [
    [
      '愛.json',
      'https://ja.dict.naver.com/api3/jako/search?query=' +
        encodeURIComponent('愛')
    ],
    [
      '爱.json',
      `https://zh.dict.naver.com/api3/zhko/search?query=${encodeURIComponent(
        '爱'
      )}&lang=zh_CN`
    ]
  ]
}
