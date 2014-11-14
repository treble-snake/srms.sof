angular.module('srms.sof.calculator')
    .controller('ClassesCtrl', ['$rootScope', 'CurrentState', 'DataSource', 'TooltipMaker', 'sortStatsFilter', 'statsToArrayFilter',
        function ($rootScope, CurrentState, DataSource, TooltipMaker, sortStats, statsToArray) {

            var BASE_CLASS_ID = 'base';
            var ctrl = this;

            DataSource.initialize()
                .then(function (promise) {
                    $rootScope.appStatus = "Готов!";
                    ctrl.setClass(BASE_CLASS_ID, DataSource.getClass(BASE_CLASS_ID));
                })
                .catch(function (err) {
                    $rootScope.appStatus = "Обломинго =(";
                });

            /* Public section */
            this.getAllClasses = DataSource.getClasses;

            this.setClass = function (classId, classData) {
                if (!ctrl.isClassAvailable(classId))
                    return;

                CurrentState.clazz.set(classId, classData);
                CurrentState.stats.reset(calculateStats(classId));
                $rootScope.applyPerks();
            };

            this.isClassSelected = function (id) {
                return id === CurrentState.clazz.id();
            };

            this.isClassAvailable = function (id) {
                return _.isEqual(id, BASE_CLASS_ID) ||
                    ctrl.isClassSelected(id) ||
                    DataSource.getClass(id).parent == CurrentState.clazz.id() ||
                    isAncestor(id, CurrentState.clazz.get());
            };

            this.getClassTooltip = function (classId, clazz) {
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
