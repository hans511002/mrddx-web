/*
 * @author:liudaquan
 * @description:highchart图表生成js
 * @create-date:2012/11/25
 *
 **************************************************************************************************/

function setChart(chartId, chartName, value,rate, minvalue,maxvalue) {
	var maxvalue2 = maxvalue+50
	if(value>maxvalue2){
		maxvalue2=value+50
	}
    $('#'+chartId).highcharts({
	
	    chart: {
	        type: 'gauge',
	        plotBackgroundColor: null,
	        plotBackgroundImage: null,
	        plotBorderWidth: 0,
	        plotShadow: false
	    },
	    title: {
	        text: chartName
	    },
	    credits: {
            text: '',
            fontSize: '0'
	    },
	    pane: {
	        startAngle: -150,
	        endAngle: 150,
	        background: [{
	            backgroundColor: {
	                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
	                stops: [
	                    [0, '#FFF'],
	                    [1, '#333']
	                ]
	            },
	            borderWidth: 0,
	            outerRadius: '109%'
	        }, {
	            backgroundColor: {
	                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
	                stops: [
	                    [0, '#333'],
	                    [1, '#FFF']
	                ]
	            },
	            borderWidth: 1,
	            outerRadius: '107%'
	        }, {
	            // default background
	        }, {
	            backgroundColor: '#DDD',
	            borderWidth: 0,
	            outerRadius: '105%',
	            innerRadius: '103%'
	        }]
	    },
	       
	    // the value axis
	    yAxis: {
	        min: 0,
	        max: maxvalue2,
	        
	        minorTickInterval: 'auto',
	        minorTickWidth: 1,
	        minorTickLength: 10,
	        minorTickPosition: 'inside',
	        minorTickColor: '#666',
	
	        tickPixelInterval: 30,
	        tickWidth: 2,
	        tickPosition: 'inside',
	        tickLength: 10,
	        tickColor: '#666',
	        labels: {
	            step: 2,
	            rotation: 'auto'
	        },
	        title: {
	            text: rate
	        },
	        plotBands: [
	        {
	            from: 0,
	            to: minvalue,
	            color: '#DDDF0D' // yellow
	        },{
	            from: minvalue,
	            to: maxvalue,
	            color: '#55BF3B' // green
	        },  {
	            from: maxvalue,
	            to: maxvalue2,
	            color: '#DF5353' // red
	        }]        
	    },
	
	    series: [{
	        name: chartName,
	        data: [value],
	        tooltip: {
	            valueSuffix: rate
	        }
	    }]
	
	});
}