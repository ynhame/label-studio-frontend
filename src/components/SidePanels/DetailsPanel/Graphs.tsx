/* usefull links:
  api documentation:
    https://echarts.apache.org/en/api.html#echarts

  how to change the plot symbols:
    https://echarts.apache.org/examples/en/editor.html?c=line-style

  reference plot:
    https://echarts.apache.org/examples/en/editor.html?c=area-simple

  apache echarts react component:
    https://www.npmjs.com/package/echarts-for-react

  chart options api reference:
    https://echarts.apache.org/en/option.html#title */

import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

function print_date(date: Date) {
  const meses = [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ]
  const month = meses[date.getMonth()];
  const year = new String(date.getFullYear());

  return month + "/" + year
}


const Graph: React.FC = (
_data:{
  data:{
    name: string,
    date:[string],
    values:{
      Q1: [number],
      median: [number],
      Q3: [number],
      mean: [number],
    }
  }
}
) => {

  console.log(_data)

  if (_data == undefined){
    const _data = {
      data : {
        name: 'Dummy Data',
        date: ["2013-05-13","2013-05-14","2013-05-15","2013-05-16","2013-05-17"],
        value: [820, 932, 901, 934, 1290, 1330, 1320]
        }
      }
  }

  let data = _data.data

  console.log(data.date.map((e) => print_date(new Date(e))));

const options = {
  animationDuration: false,
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  title: {
    left: 'center',
    text: data.name,
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: 'valor'
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: data.date.map(e => print_date(new Date(e)))
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%']
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      start: 0,
      end: 10
    }
  ],
  series: [
    {
      name: 'Q1',
      data: data.values.Q1,
      type: 'line',
      sampling: 'lttb',
      itemStyle: { color: 'rgb(70, 255, 131)' },
      lineStyle: { opacity: 0 },
      stack: 'confidence-band',
      symbol: 'none',
    },
    {
      name: 'median',
      type: 'line',
      symbol: 'circle',
      simbolSize: 100,
      sampling: 'lttb',
      itemStyle: {
        color: 'rgb(70, 255, 50)'
      },
      lineStyle: { width: 5 },
      data: data.values.median
    },
    {
      name: 'Q3',
      data: data.values.Q3,
      type: 'line',
      sampling: 'lttb',
      itemStyle: { color: 'rgb(70, 255, 131)' },
      lineStyle: { opacity: 0 },
      areaStyle: { color: 'rgb(70, 255, 131)', opacity: 0.5 },
      stack: 'confidence-band',
      symbol: 'none',
    },
    /* {
      name: 'mean',
      type: 'line',
      symbol: 'triangle',
      simbolSize: 40,
      sampling: 'lttb',
      itemStyle: {
        color: 'rgb(255, 70, 131)'
      },
      data: data.values.mean
    } */
  ]
};
  return <ReactECharts option={options} />;
};

export default Graph;

