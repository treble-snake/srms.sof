angular.module('srms.sof')
    .controller('CorporationsCtrl', ['DataSource', function (DataSource) {

        function initChart(data) {
            $('#corps-pie').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: 'Влияние корпораций на рынке нейтринита, ноябрь 2064'
                },
                tooltip: {
                    pointFormat: '<p>{point.desc}</p>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'Доля корпораций',
                        data: data
                    }
                ]
            });
        }

        DataSource.getCorporations().then(function (result) {
            initChart(_.map(result.data, function (item) {
                item['y'] = item['value'];
                return item;
            }));
        });

    }]);