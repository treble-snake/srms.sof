angular.module('srms.sof')
    .controller('ClassesCtrl', ['$rootScope', 'CurrentState', 'DataSource', 'TooltipMaker', 'sortStatsFilter', 'statsToArrayFilter',
        function ($rootScope, CurrentState, DataSource, TooltipMaker, sortStats, statsToArray) {

            var BASE_CLASS_ID = 'base';
            var ctrl = this;

            this.init = function () {
                ctrl.choose(BASE_CLASS_ID, DataSource.getClass(BASE_CLASS_ID));
            };

            /* Public section */
            this.getAll = DataSource.getClasses;

            this.isSelected = function (id) {
                return id === CurrentState.clazz.id();
            };

            this.isAvailable = function (id, clazz) {
                return _.isEqual(id, BASE_CLASS_ID) ||
                    ctrl.isSelected(id) ||
                    clazz.parent == CurrentState.clazz.id() ||
                    isAncestor(id, CurrentState.clazz.get());
            };

            this.choose = function (classId, classData) {
                if (!ctrl.isAvailable(classId, classData))
                    return;

                CurrentState.clazz.set(classId, classData);
                CurrentState.stats.reset(calculateStats(classId));
                // TODO that's not right
                if($rootScope.applyPerks)
                    $rootScope.applyPerks();
            };

            this.getTooltip = function (classId, clazz) {
                return TooltipMaker.renderTooltip(clazz,
                    sortStats(statsToArray(calculateStats(classId))), composeTooltipStatName);
            };

            /* Private section */

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

            function calculateStats(classID, result) {
                // initialize result at the first call
                if (_.isUndefined(result))
                    result = {};

                var clazz = DataSource.getClass(classID);
                if (!clazz)
                    return result;

                // base stats can't be complex
                var stats = clazz.stats.base;
                _.each(stats, function (value, id) {
                    if (!_.has(result, id))
                        result[id] = value;
                });

                // special stats can be complex
                stats = clazz.stats.special;
                for (var key in stats) {
                    if (!_.has(result, key))
                        result[key] = stats[key];
                    else {
                        // TODO make it recursive
                        if (_.isObject(stats[key])) {
                            for (var subKey in stats[key]) {
                                if (!_.has(result[key], subKey)) {
                                    result[key][subKey] = stats[key][subKey];
                                }
                            }
                        }
                    }
                }
                return calculateStats(clazz.parent, result);
            }
        }]);
