'use strict'

// generate engines 

var utils = require('../../../utils')
var Highcharts = require('highcharts')

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      isHidden: true,
      isFaild: false
    }
  },
  events: {
    'chart-hide': function(flag) {
      this.isHidden = flag
    },
    search: function(selection) {
      // same selection, no need for searching
      if (this.selection === selection) return

      // update selection
      this.selection = selection

      this.isFaild = true
      var that = this
      utils
        .sendMessage({
          msg: 'translate',
          id: 'dictcn',
          text: selection
        })
        .then(function(response) {
          if (response.data) {
            that.showChart(response.data)
            that.isFaild = false
          } else {
            that.isFaild = true
          }
        }, function() {
          that.isFaild = true
        })
      // keep broadcasting!
      return true
    }
  },
  methods: {
    showChart: function(data) {
      var options = {
        chart: {
          renderTo: this.$el.contentWindow.document.body,
          spacingTop: 10,
          spacingRight: 0,
          spacingBottom: 20,
          spacingLeft: 0,
          width: 270,
          height: 200
        },
        title: {
          text: '释义常用度分布图',
          align: 'left',
          margin: 20,
          style: {
            color: '#808080',
            fontSize: '12px'
          }
        },
        tooltip: {
          formatter: function() {
            return '常用度:' + Highcharts.numberFormat(this.percentage, 0) + ' %'
          },
          style: {
            padding: '4px',
            lineHeight: '20px'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            startAngle: 90,
            size: 100,
            slicedOffset: 8,
            dataLabels: {
              distance: 14,
              softConnector: false,
              useHTML: true,
              connectorPadding: 6,
              connectorColor: '#808080',
              formatter: function() {
                return this.point.name
              },
              style: {
                color: '#666',
                fontSize: '12px'
              }
            }
          }
        },
        credits: {
          text: '海词统计',
          style: {
            cursor: 'default',
            color: '#808080',
            fontSize: '12px'
          },
          position: {
            x: -2,
            y: -4
          }
        },
        series: [{
          type: 'pie',
          name: '分布比例：',
          colors: ['#19B29F', '#53C8BA', '#62DDCF', '#82E3D9', '#9EF0E8', '#74E7DA', '#93F3E8', '#ACFBF2', '#BFF3EE', '#D0FFFB'],
          data: []
        }]
      }

      Object.keys(data).forEach(function(i) {
        var title = byteSub(data[i].sense, 8)
        options.series[0].data.push(['<font title="' + data[i].sense + '">' + title + '</font>', data[i].percent])
      })
      
      new Highcharts.Chart(options)
    }
  }
}

function byteSub(d, e) {
  var c = /[^\x00-\xff]/g
  if (d.replace(c, 'mm').length <= e) {
    return d
  }
  var a = Math.floor(e / 2)
  for (var b = a; b < d.length; b++) {
    if (d.substr(0, b).replace(c, 'mm').length >= e) {
      return d.substr(0, b) + '..'
    }
  }
  return d
}
