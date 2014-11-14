angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])

    .controller('CalculatorCtrl', ['$rootScope', function ($rootScope) {
        $rootScope.appStatus = "Загрузка..";
        this.version = "0.3.5";
    }])
    .controller('StatsCtrl', [
        '$scope', 'CurrentState', 'DataSource',
        function ($scope, CurrentState, DataSource) {
            this.getStatsInfo = DataSource.getStatsInfo;
            this.getStatValues = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.clazz.get;
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