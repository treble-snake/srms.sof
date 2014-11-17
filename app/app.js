angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/about'
            })
            .when('/about', {
                templateUrl: 'app/views/about.html'
            })
            .when('/implants', {
                templateUrl: 'app/views/calculator.html'
            })
            .when('/corporations', {
                templateUrl: 'app/views/corporations.html',
                controller: 'CorporationsCtrl'
            })
            .otherwise({
                templateUrl: 'app/views/empty.html'
            })
    })
    .controller('AppCtrl', ['$rootScope', '$scope', '$location',
        function ($rootScope, $scope, $location) {
            $rootScope.appStatus = "Загрузка..";
            $rootScope.version = "0.4.4";

            this.pages = [
                {url: 'contracts', name: 'Контракты'},
                {url: 'mercenaries', name: 'Наемники'},
                {url: 'implants', name: 'Импланты'},
                {url: 'corporations', name: 'Корпорации'},
                {url: 'about', name: 'О проекте'}
            ];

            this.isCurrentPage = function (url) {
                return  url === $location.path().substring(1)
            }
        }])
    .controller('StatsCtrl', [
        '$scope', 'CurrentState', 'DataSource',
        function ($scope, CurrentState, DataSource) {
            this.getStatsInfo = DataSource.getStatsInfo;
            this.getStatValues = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.clazz.get;
            this.getCost = CurrentState.cost.get;
        }])
    .directive('statsPane', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'app/partials/stats.pane.html',
                restrict: 'A',
                scope: {
                    statValues: "=",
                    stats: '=statInfo'
                },
                compile: function (element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element);
                }
            }
        }]);