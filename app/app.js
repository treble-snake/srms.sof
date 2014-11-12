var sofApp = angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source']);

sofApp
    .controller('CalculatorCtrl', ['$rootScope', function ($rootScope) {
        $rootScope.appStatus = "Загрузка..";
        this.version = "0.3.0";
    }])
    .controller('StatsCtrl', [
        'CurrentState', 'DataSource',
            function (CurrentState, DataSource) {
                this.getAllStats = DataSource.getStatsInfo;
                this.getCurrentStats = CurrentState.stats.get;
                this.getCurrentClass = CurrentState.getClass;
            }])
    .directive('statsPane', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'app/partials/stats.pane.html',
                restrict: 'A',
                scope: {
                    currentStats: '=',
                    stats: '=allStats'
                },
                compile: function (element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element);
                }
            }
        }])
;
