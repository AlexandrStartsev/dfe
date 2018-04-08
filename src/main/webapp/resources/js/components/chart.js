define('components/chart', ['components/component', 'ui/utils', 'echarts'], function(component, utils, echarts) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    function defer(p, c, d, e, a, t) { return c._deferred = p ? 0 : function(p) {c.component.render(p, c, d, e, a, t)} }  
    return _extend({
        cname: 'chart',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                var rt = this.runtime(control);
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                    rt.chart = echarts.init(control.ui);
                    //this.setEvents(control.ui, control, data, errs, attrs); // ??
                }
                data && data.series ? rt.chart.setOption(data) : rt.chart.clear();
                this.setAttributes(control, errs, attrs);
            }
        }
    }, component, component.base())
})

/*

// https://ecomfe.github.io/echarts-doc/public/en/tutorial.html
                    var myChart = echarts.init(document.getElementById('chart'));
                    var option = {
                        title: {
                            text: 'ECharts entry example'
                        },
                        tooltip: {},
                        legend: {
                            data:['Sales']
                        },
                        //xAxis: { data: ["shirt","cardign","chiffon shirt","pants","heels","socks"] },
                        //yAxis: {},
                        //series: [{
                          //  name: 'Sales',
                            //type: 'bar',
                            //data: [5, 20, 36, 10, 10, 20]
                        //}]
                        series: [{
                            name: 'Sales',
                            type: 'pie',
                            data: [{name: "shirt", value: 5},
                                   {name: "cardign", value: 20},
                                   {name: "chiffon shirt", value: 36},
                                   {name: "pants", value: 10},
                                   {name: "heels", value: 10},
                                   {name: "socks", value: 20}]
                        }]

                    };
                    // use configuration item and data specified to show chart
                    myChart.setOption(option);

*/