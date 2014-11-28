angular.module('srms.sof')
    .controller('ClassesCtrl', ['$rootScope', 'CurrentState', 'DataSource', 'TooltipMaker', 'sortStatsFilter', 'statsToArrayFilter',
        function ($rootScope, CurrentState, DataSource, TooltipMaker, sortStats, statsToArray) {

            var BASE_CLASS_ID = 'base';
            var ctrl = this;

            this.init = function () {
                ctrl.choose(BASE_CLASS_ID, DataSource.getClass(BASE_CLASS_ID));
            };

            /* Public section */
            this.getClass = DataSource.getClass;
            this.baseClassId = [BASE_CLASS_ID];

            this.isSelected = function (id) {
                return id === CurrentState.clazz.id();
            };

            this.isAvailable = function (id) {
                return _.isEqual(id, BASE_CLASS_ID) ||
                    ctrl.isSelected(id) ||
                    DataSource.getClass(id).parent == CurrentState.clazz.id() ||
                    isAncestor(id, CurrentState.clazz.get());
            };

            this.choose = function (classId) {
                if (!ctrl.isAvailable(classId))
                    return;

                CurrentState.clazz.set(classId);
                CurrentState.stats.reset(calculateStats(classId));
                // TODO that's not right
                if ($rootScope.applyPerks)
                    $rootScope.applyPerks();
            };

            this.getTooltip = function (classId) {
                return TooltipMaker.renderTooltip(DataSource.getClass(classId),
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

            function addSpecialStats(stats, result) {
                _.each(stats, function (value, id) {
                    if (!_.has(result, id))
                        result[id] = stats[id];
                    else if (_.isObject(value))
                        addSpecialStats(value, result[id]);
                });
            }

            function calculateStats(classId, result) {
                // initialize result at the first call
                if (_.isUndefined(result))
                    result = {};

                var clazz = DataSource.getClass(classId);
                if (!clazz)
                    return result;

                // base stats can't be complex
                _.each(clazz.stats.base, function (value, id) {
                    if (!_.has(result, id))
                        result[id] = value;
                });

                // special stats can be complex
                addSpecialStats(clazz.stats.special, result);

                return calculateStats(clazz.parent, result);
            }
        }
    ]);
