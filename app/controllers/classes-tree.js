angular.module('srms.sof.calculator')
    .controller('ClassesCtrl', [
        '$rootScope', 'CurrentState', 'DataSource',
        function ($rootScope, CurrentState, DataSource) {

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

                CurrentState.setClass(classId, classData);
                // TODO problem with reference of nested stats (reference)
                CurrentState.stats.reset(calculateStats(classId));
                $rootScope.applyPerks();
            };

            this.isClassSelected = function (id) {
                return id === CurrentState.getClassId();
            };

            this.isClassAvailable = function (id) {
                return _.isEqual(id, BASE_CLASS_ID) ||
                    ctrl.isClassSelected(id) ||
                    DataSource.getClass(id).parent == CurrentState.getClassId() ||
                    isAncestor(id, CurrentState.getClass());
            };

            // TODO use templates
            this.getClassTooltip = function (classId, clazz) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + clazz.name + '</h1>');
                result.append('<p class="desc">' + clazz.desc + '</p>');
                result.append('<h2>Характеристики</h2>');
                appendTooltipStats(calculateStats(classId), result);

                return result.wrap("<div/>").parent().html();
            };

            /* Private section */
            // TODO recursive? use for perks?
            function appendTooltipStats(stats, parent) {
                _.each(stats, function (value, id) {
                    var statInfo = DataSource.getStat(id);
                    if (!_.isUndefined(statInfo)) {
                        var statText = statInfo.name;

                        if (!_.isObject(value) && !_.isNull(value)) {
                            statText += ": " + value;
                            if (!_.isUndefined(statInfo.measure))
                                statText += " " + statInfo.measure;
                        }

                        parent.append('<div class="tooltip-stat">' + statText + '</div>');

                        if (_.isObject(value)) {
                            appendTooltipStats(value, parent.children(".tooltip-stat").last());
                        }
                    }
                });

                return parent;
            }

            function isAncestor(ancestorId, child) {
                if (_.isUndefined(ancestorId) || _.isUndefined(child))
                    return false;
                if (child.parent === ancestorId)
                    return true;

                return isAncestor(ancestorId, DataSource.getClass(child.parent));
            }

            function calculateStats(id, result) {
                if (_.isUndefined(result))
                    result = {};

                var clazz = DataSource.getClass(id);
                if (_.isUndefined(clazz))
                    return result;

                var stats = clazz.stats.base;
                for (var key in stats) {
                    if (!_.has(result, key))
                        result[key] = stats[key];
                }
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