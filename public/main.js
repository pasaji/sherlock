// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('main'));

$.get('state', function (state) {
  console.log('state', state);

  // specify chart configuration item and data
  var option = {
    animation: false,
    title: {
      text: state.market
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        type: 'cross',
        lineStyle: {
          color: '#376df4',
          width: 1,
          opacity: 1
        }
      },
      position: function (pos, params, el, elRect, size) {
          var obj = {top: 10};
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
      },
      backgroundColor: '#333'
    },
    axisPointer: {
      link: { xAxisIndex: 'all' },
    },
    legend: {
      data:['Sales']
    },
    grid: [
      {
        top: '5%',
        left: '5%',
        right: '5%',
        height: '40%'
      },
      {
        left: '5%',
        right: '5%',
        top: '50%',
        height: '40%'
      }
    ],
    xAxis: [
      {
        data: state.data.map(function(item, index) {
          return moment(item.date).format('HH:mm');
        }),
        position: 'top'
      },
      {
        data: state.data.map(function(item, index) {
          return moment(item.date).format('hh:mm');
        }),
        gridIndex: 1
      }
    ],
    yAxis: [
      {
        // candles
        scale: true,
        gridIndex: 0
      },
      {
        // rsi
        scale: true,
        gridIndex: 1,
        min: 10,
        max: 90
      }
    ],
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'slider',
        xAxisIndex: [0,1],
        filterMode: 'filter',
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        xAxisIndex: [0,1]
      }/*,
      {
        type: 'inside',
        yAxisIndex: [0]
      }*/
    ],
    series: [
      {
        name: 'candles',
        type: 'candlestick',
        data: state.data.map(function(item, index) {
          // [open, close, lowest, highest]
          return [ item.open, item.close, item.low, item.high ]
        })
      },
      {
        name: 'bb upper',
        type: 'line',
        lineStyle: { normal: { color:'#dddddd' } },
        data: state.data.map(function(item, index) {
          if (!item.bb) return null;
          return item.bb.upper
        })
      },
      {
        name: 'bb lower',
        type: 'line',
        lineStyle: { normal: { color:'#dddddd' } },
        data: state.data.map(function(item, index) {
          if (!item.bb) return null;
          return item.bb.lower
        })
      },

      {
        name: 'buy',
        type: 'scatter',
        itemStyle: { color:'#00cc00' },
        data: state.data.map(function(item, index) {
          if (!item.action) return null
          if (item.action.type === 'buy') {
            return item.close
          }
          return null
        })
      },
      {
        name: 'sell',
        type: 'scatter',
        itemStyle: { color:'#cc0000' },
        data: state.data.map(function(item, index) {
          if (!item.action) return {}
          if (item.action.type === 'sell') {
            return item.close
          }
          return null
        })
      },
      {
        name: 'note',
        type: 'scatter',
        itemStyle: { color:'#000000' },
        data: state.data.map(function(item, index) {
          if (!item.note) return {}
          return item.close
        })
      },
      {
        name: 'ziczac',
        type: 'scatter',
        itemStyle: { color:'#FFcc00' },
        data: state.data.map(function(item, index) {
          if (!item.ziczac) return {}
          if (item.ziczac.type == 'high') return item.close
          return {}
        })
      },
      {
        name: 'ziczac',
        type: 'scatter',
        itemStyle: { color:'#0000FF' },
        data: state.data.map(function(item, index) {
          if (!item.ziczac) return {}
          if (item.ziczac.type == 'low') return item.close
          return {}
        })
      },
      {
        name: 'rsi',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: state.data.map(function(item, index) {
          return item.rsi
        })
      },
      {
        name: 'rsi ziczic',
        type: 'scatter',
        itemStyle: { color:'#FFCC00' },
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: state.data.map(function(item, index) {
          if (!item.ziczacRsi) return {}
          if (item.ziczacRsi.type == 'high') return item.rsi
          return {}
        })
      },
      {
        name: 'rsi ziczic',
        type: 'scatter',
        itemStyle: { color:'#0000FF' },
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: state.data.map(function(item, index) {
          if (!item.ziczacRsi) return {}
          if (item.ziczacRsi.type == 'low') return item.rsi
          return {}
        })
      }
    ]
  };
  myChart.setOption(option);

});
