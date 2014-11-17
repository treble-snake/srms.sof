angular.module('srms.sof')
    .controller('CorporationsCtrl', [function () {
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
                    data: [
                        {
                            name: 'Texas Miners\' Coalition',
                            y: 21.8,
                            desc: "Описание корпорации бла бла бла. Бла бла."
                        },
                        {
                            name: 'Eastern Prime Dig, Inc',
                            y: 19.4,
                            desc: "Описание корпорации бла бла бла. Бла бла."
                        },
                        {
                            name: 'Mineiros militar',
                            y: 24.4,
                            desc: "Описание корпорации бла бла бла. Бла бла."
                        },
                        {
                            name: 'Нейпром',
                            y: 20.1,
                            desc: "Мечты сбываются."
                        },
                        {
                            name: 'Elite mining, Ltd',
                            y: 14.3,
                            desc: "Описание корпорации бла бла бла. Бла бла."
                        }
                    ]
                }
            ]
        });

    }]);