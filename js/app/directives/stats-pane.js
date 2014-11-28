angular.module('srms.sof')
    .directive('statsPane', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'js/app/partials/stats.pane.html',
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