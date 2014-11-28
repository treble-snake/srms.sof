angular.module('srms.sof')
    .directive('classItem', [
        'RecursionHelper',
        function (RecursionHelper) {
            return {
                templateUrl: 'js/app/partials/class-tree.item.html',
                restrict: 'A',
                controller: 'ClassesCtrl',
                controllerAs: 'ctrl',
                scope: {
                    root: '=',
                    currentItems: '='
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
                templateUrl: 'js/app/partials/perk-tree.item.html',
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
    .directive('loadinfo', function(){
        return {
            restrict: 'E',
            template: '<div class="loadinfo"><alert ng-if="error" type="danger">{{error}}</alert>' +
                '<img ng-if="!error" src="img/loadinfo.gif" alt="Загрузка..."/></div>',
            scope: {
                error: "="
            },
            replace: true
        }
    });