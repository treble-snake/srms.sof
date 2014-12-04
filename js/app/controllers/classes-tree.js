angular.module('srms.sof')
    .controller('ClassesCtrl', ['$scope', 'CurrentState', 'DataSource', 'TooltipMaker', 'PerksHelper', 'CurrentUser', 'Confirmation', 'sortStatsFilter', 'statsToArrayFilter',
        function ($scope, CurrentState, DataSource, TooltipMaker, PerksHelper, CurrentUser, Confirmation, sortStats, statsToArray) {

            var BASE_CLASS_ID = 'base';
            var ctrl = this;

            this.init = function () {
                chooseClass(BASE_CLASS_ID);
            };

            /* Public section */
            this.getClass = DataSource.getClass;
            this.baseClassId = [BASE_CLASS_ID];

            this.isSelected = function (id) {
                return id === CurrentState.clazz.id();
            };

            this.isAffordable = function (id) {
                return !$scope.restrictedMode ||
                    DataSource.getClass(id).price <= CurrentUser.getUser().money
            };

            this.isAvailable = function (id) {

                if ($scope.restrictedMode && DataSource.getClass(id).parent != CurrentState.clazz.id())
                    return false;

                return _.isEqual(id, BASE_CLASS_ID) ||
                    ctrl.isSelected(id) ||
                    DataSource.getClass(id).parent == CurrentState.clazz.id() ||
                    isAncestor(id, CurrentState.clazz.get());
            };

            this.choose = function (id) {
                if (!ctrl.isAvailable(id) || !ctrl.isAffordable(id))
                    return;

                if ($scope.restrictedMode) {
                    var clazz = DataSource.getClass(id);
                    Confirmation.open('Купить имплант "' + clazz.name + '"?',
                            'Это обойдется вам в $' + clazz.price).then(function () {
                            DataSource.setClass({buildId: $scope.buildId, classId: id})
                                .then(function () {
                                    chooseClass(id);
                                    CurrentUser.updateMoney(-1 * clazz.price);
                                })
                        })
                } else {
                    chooseClass(id);
                }
            };

            this.getTooltip = function (classId) {
                return TooltipMaker.renderTooltip(DataSource.getClass(classId),
                    sortStats(statsToArray(CurrentState.clazz.stats(classId))), composeTooltipStatName);
            };

            /* Private section */
            function chooseClass(id) {
                CurrentState.clazz.set(id);
                PerksHelper.applyCurrentPerks();
            }

            function composeTooltipStatName(stat) {
                var statInfo = DataSource.getStat(stat.id);
                var result = statInfo.name;

                if (_.isObject(stat.value) || _.isNull(stat.value))
                    return result;

                result += ": " + stat.value;
                if (statInfo.measure)
                    result += " " + statInfo.measure;

                return result;
            }

            function isAncestor(ancestorId, child) {
                if (_.isUndefined(ancestorId) || _.isUndefined(child))
                    return false;
                if (child.parent === ancestorId)
                    return true;

                return isAncestor(ancestorId, DataSource.getClass(child.parent));
            }
        }
    ]);
