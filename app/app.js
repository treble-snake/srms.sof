angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/views/empty.html',
                controller: function(){
                }
            })
            .when('/about', {
                templateUrl: 'app/views/about.html'
            })
            .when('/implants', {
                templateUrl: 'app/views/calculator.html'
            })
            .otherwise({
                redirectTo: '/'
            })
    })
    .controller('AppCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {
        $rootScope.appStatus = "Загрузка..";
        $rootScope.version = "0.4.0";

        $scope.pages = [
            {url: 'contracts', name: 'Контракты'},
            {url: 'mercenaries', name: 'Наемники'},
            {url: 'implants', name: 'Импланты'},
            {url: 'corporations', name: 'Корпорации'},
            {url: 'about', name: 'О проекте'}
        ];
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