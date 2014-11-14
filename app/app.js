var sofApp = angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source']);

sofApp
    .controller('CalculatorCtrl', ['$rootScope', function ($rootScope) {
        $rootScope.appStatus = "Загрузка..";
        this.version = "0.3.4";
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
        }])
    .filter('statsToArray', ['DataSource', function (DataSource) {
        return function(input) {
            return _.map(input, function (value, key) {
                // TODO recursion, bitch!
                if (_.isObject(value)) {
                    value = _.map(value, function (subValue, subKey) {
                        return {
                            id: subKey,
                            value: subValue,
                            order: DataSource.getStat(subKey).order
                        }
                    });
                }
                return {
                    id: key,
                    value: value,
                    order: DataSource.getStat(key).order
                }
            })
        }
    }])
    .filter('sortStats', ['DataSource', function (DataSource) {
        var DEFAULT_ORDER = 0;

        function getOrder(item) {
                return item.order || DEFAULT_ORDER;
        }

        function compareNames(a, b) {
            if(a.id < b.id) return -1;
            if(a.id > b.id) return 1;
            console.warn("equal stat names");
            return 0;
        }

        return function filter(input) {
//            console.log("sort called");
            return input.sort(function(a, b){
                var diff = getOrder(b) - getOrder(a);
                return  diff == 0 ? compareNames(a, b) : diff;
            });
        };
    }])
;
