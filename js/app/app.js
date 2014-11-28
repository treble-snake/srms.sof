angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'ngAnimate',
        'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])

    .controller('AppCtrl', ['$location', 'CurrentUser', function ($location, CurrentUser) {
        this.version = "0.6.1";

        CurrentUser.init();

        this.pages = [
            {url: 'contracts', name: 'Контракты'},
            {url: 'account', name: 'Досье', auth: true},
            {url: 'mercenaries', name: 'Наемники'},
            {url: 'implants', name: 'Импланты'},
            {url: 'corporations', name: 'Корпорации'},
            {url: 'news', name: 'Новости'},
            {url: 'about', name: 'О проекте'}
        ];

        this.isCurrentPage = function (url) {
            return  $location.path().substring(1).indexOf(url) === 0;
        };

        this.isAuth = CurrentUser.getUser;
    }])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/news'
            })
            .when('/about', {
                templateUrl: 'js/app/views/about.html'
            })
            .when('/implants', {
                templateUrl: 'js/app/views/calculator.html',
                controller: 'CalculatorCtrl',
                controllerAs: 'calculator'
            })
            .when('/corporations', {
                templateUrl: 'js/app/views/corporations.html',
                controller: 'CorporationsCtrl'
            })
            .when('/news', {
                redirectTo: '/news/all'
            })
            .when('/news/:tag', {
                templateUrl: 'js/app/views/news.html',
                controller: 'NewsCtrl',
                controllerAs: 'ctrl'
            })
            .when('/account', {
                templateUrl: 'js/app/views/account.html',
                controller: 'AccountCtrl',
                controllerAs: 'ctrl'
            })
            .otherwise({
                templateUrl: 'js/app/views/empty.html'
            })
    })

    .controller('StatsCtrl', [
        '$scope', 'CurrentState', 'DataSource',
        function ($scope, CurrentState, DataSource) {
            this.statsInfo = DataSource.getStatsInfo();
            this.getStatValues = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.clazz.get;
            this.getCost = CurrentState.cost.get;
        }])
;