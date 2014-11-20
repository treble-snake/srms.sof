angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'ngAnimate',
        'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])

    .controller('AppCtrl', ['$location', function ($location) {
        this.version = "0.5.0";

        this.pages = [
            {url: 'contracts', name: 'Контракты'},
            {url: 'mercenaries', name: 'Наемники'},
            {url: 'implants', name: 'Импланты'},
            {url: 'corporations', name: 'Корпорации'},
            {url: 'news', name: 'Новости'},
            {url: 'about', name: 'О проекте'}
        ];

        this.isCurrentPage = function (url) {
            return  url === $location.path().substring(1)
        }
    }])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/about'
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
    .controller('CalculatorCtrl', ['DataSource',
        function (DataSource) {
            var ctrl = this;
            this.isReady = false;
            this.error = '';

            DataSource.initialize()
                .then(function (promise) {
                    ctrl.isReady = true;
                })
                .catch(function (err) {
                    ctrl.error = "Что-то пошло не так. :(";
                });
        }])
    .controller('NewsCtrl', ['DataSource', function (DataSource) {
        var ctrl = this;
        this.news = [];
        this.isReady = false;
        this.error = '';

        DataSource.getNews()
            .then(function (promise) {
                ctrl.news = promise.data.data;
                ctrl.isReady = true;
            })
            .catch(function (data) {
                ctrl.error = 'Что-то пошло не так :(';
            })
    }])
;