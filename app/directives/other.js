angular.module('srms.sof')
    .directive('classItem', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'app/partials/class-tree.item.html',
                restrict: 'A',
                controller: 'ClassesCtrl',
                controllerAs: 'ctrl',
                scope: {
                    root: '=',
                    itemsList: '='
                },
                compile: function (element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element);
                }
            }
        }])
    .directive('perkItem', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'app/partials/perk-tree.item.html',
                restrict: 'A',
                controller: 'PerksCtrl',
                controllerAs: 'ctrl',
                scope: {
                    root: '=',
                    itemsList: '='
                },
                compile: function (element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element);
                }
            }
        }])
    .directive('treeItem', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'app/partials/tree-item.html',
                restrict: 'A',
                controller: '@',
                controllerAs: 'ctrl',
                name: 'ctrlName',
                scope: {
                    root: '=',
                    itemsList: '=',
                    type: '@',
                    ctName: '@'
                },
                compile: function (element) {
                    // Use the compile function from the RecursionHelper,
                    // And return the linking function(s) which it returns
                    return RecursionHelper.compile(element);
                }
            }
        }]);