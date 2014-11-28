angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'ngAnimate',
        'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])

    .controller('AppCtrl', ['$location', function ($location) {
        this.version = "0.6.1";

        this.pages = [
            {url: 'contracts', name: 'Контракты'},
            {url: 'mercenaries', name: 'Наемники'},
            {url: 'implants', name: 'Импланты'},
            {url: 'corporations', name: 'Корпорации'},
            {url: 'news', name: 'Новости'},
            {url: 'about', name: 'О проекте'}
        ];

        this.isCurrentPage = function (url) {
            return  $location.path().substring(1).indexOf(url) === 0;
        }
    }])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/news'
            })
            .when('/about', {
                templateUrl: 'app/views/about.html'
            })
            .when('/implants', {
                templateUrl: 'app/views/calculator.html',
                controller: 'CalculatorCtrl',
                controllerAs: 'calculator'
            })
            .when('/corporations', {
                templateUrl: 'app/views/corporations.html',
                controller: 'CorporationsCtrl'
            })
            .when('/news', {
                redirectTo: '/news/all'
            })
            .when('/news/:tag', {
                templateUrl: 'app/views/news.html',
                controller: 'NewsCtrl',
                controllerAs: 'ctrl'
            })
            .otherwise({
                templateUrl: 'app/views/empty.html'
            })
    })

    .controller('StatsCtrl', [
        '$scope', 'CurrentState', 'DataSource',
        function ($scope, CurrentState, DataSource) {
            this.getStatsInfo = DataSource.getStatsInfo;
            this.getStatValues = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.clazz.get;
            this.getCost = CurrentState.cost.get;
        }])
;