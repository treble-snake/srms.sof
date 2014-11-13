var sofApp = angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source']);

sofApp
    .controller('CalculatorCtrl', ['$rootScope', function ($rootScope) {
        $rootScope.appStatus = "Загрузка..";
        this.version = "0.3.1";
    }])
    .controller('StatsCtrl', [
        'CurrentState', 'DataSource',
        function (CurrentState, DataSource) {
            this.getAllStats = DataSource.getStatsInfo;
            this.getCurrentStats = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.getClass;
            this.getStatValue = CurrentState.get;
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
    .filter('keysOnly', function () {
        return function filter(input) {
            return _.keys(input);
        }
    })
    .filter('sortStats', ['DataSource', function (DataSource) {
        function doTheShit(input) {

            var sorted = _.sortBy(input, function (key) {
                return Math.random() * 1000;
            });

            console.log("Input:");
            console.log(input);
            console.log("Sorted:");
            console.log(sorted);

            input.push("launcher");

            return input.sort();



//            var sorted = {},
//                key, a = [];
//
//            for (key in input) {
//                if (input.hasOwnProperty(key)) {
//                    a.push(key);
//                }
//            }
//
//            a = _.sortBy(a, function (key) {
//                return Math.random() * 1000;
//            });
//
//            for (key = 0; key < a.length; key++) {
//                sorted[a[key]] = input[a[key]];
//            }
//

//
//            return sorted;

        }

        return doTheShit;
    }])
;
