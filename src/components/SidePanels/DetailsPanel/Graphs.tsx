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
    value:[number]
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
      name: data.name,
      type: 'line',
      symbol: 'circle',
      simbolSize: 40,
      sampling: 'lttb',
      itemStyle: {
        color: 'rgb(70, 255, 131)'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(158, 255, 68)'
          },
          {
            offset: 1,
            color: 'rgb(70, 255, 131)'
          }
        ])
      },
      data: data.value
    }
  ]
};
  return <ReactECharts option={options} />;
};

export default Graph;

