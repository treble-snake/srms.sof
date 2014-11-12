var sofApp = angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source']);

sofApp
    .controller('CalculatorCtrl', ['$scope', function ($scope) {
        $scope.appStatus = "Загрузка..";
        this.version = "0.2.5";
    }])

    .controller('ClassesCtrl', [
        '$scope', '$rootScope', 'CurrentState', 'DataSource',
        function ($scope, $rootScope, CurrentState, DataSource) {

            var BASE_CLASS_ID = 'base';
            var ctrl = this;

            DataSource.initialize()
                .then(function (promise) {
                    $scope.appStatus = "Готов!";
                    ctrl.setClass(BASE_CLASS_ID, DataSource.getClass(BASE_CLASS_ID));
                })
                .catch(function (err) {
                    $scope.appStatus = "Обломинго =(";
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
        }])

    .controller('StatsCtrl', [
        'CurrentState', 'DataSource',
            function (CurrentState, DataSource) {
                this.getAllStats = DataSource.getStatsInfo;
                this.getCurrentStats = CurrentState.stats.get;
                this.getCurrentClass = CurrentState.getClass();
            }])

    .controller('PerksCtrl', [
        '$scope', '$rootScope', 'CurrentState', 'DataSource',
        function ($scope, $rootScope, CurrentState, DataSource) {

            var ctrl = this;

            /* Public section */
            this.getAllPerks = DataSource.getPerks;

            this.isPerkAvailable = function (perk) {
                var current = CurrentState.getClass();
                var need = perk.for;
                if (current.level < need.level)
                    return false;

                if (!_.isEmpty(need.classOnly)
                    && !_.contains(need.classOnly, current.id))
                    return false;

                if (!_.isEmpty(need.classExcept)
                    && _.contains(need.classExcept, current.id))
                    return false;

                if (!_.isUndefined(perk.parent) && !_.contains(CurrentState.perks.get(), perk.parent))
                    return false;

                return true;
            };

            this.addPerk = function (id) {
                var perk = DataSource.getPerk(id);
                if (!perk || !ctrl.isPerkAvailable(perk))
                    return;

                applyPerk(perk);
                CurrentState.perks.toggle(id);
                perk.selected = !perk.selected;
            };

            // TODO use templates
            this.getPerkTooltip = function (perkId, perk) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + perk.name + '</h1>');
                result.append('<p class="desc">' + perk.desc + '</p>');
                result.append('<h2>Характеристики</h2>');

                _.each(perk.effects, function (stats, effectId) {
                    var effect = effectsMap[effectId];
                    _.each(stats, function (statValue, statId) {
                        var statText =
                            effect.getName(statValue) + " " + DataSource.getStat(statId).name
                        result.append('<div class="tooltip-stat">' + statText + '</div>');
                    });
                });

                result.append('<h2>Требования</h2>');
                _.each(perk.for, function (value, id) {
                    result.append('<div class="tooltip-stat">' +
                        restrictionsMap[id].getHint(value) + '</div>');
                });

                return result.wrap("<div/>").parent().html();
            };

            /* Private section */

            // TODO move to a service
            $rootScope.applyPerks = function() {
                _.each(CurrentState.perks.get(), function (id) {
                    var perk = DataSource.getPerk(id);
                    if (!ctrl.isPerkAvailable(perk)) {
                        perk.selected = false;
                        CurrentState.perks.remove(id);
                        return;
                    }
                    applyPerk(perk);
                    perk.selected = true;
                })
            };

            // TODO recursive, bitch!
            function applyPerk(perk) {
                _.each(perk.effects, function (stats, id) {
                    var effect = effectsMap[id];
                    _.each(stats, function (value, id) {
                        if (_.isObject(value)) {
                            _.each(value, function (subValue, subId) {
                                effect.apply(subId, subValue, perk.selected);
                            });
                        }
                        else
                            effect.apply(id, value, perk.selected);
                    })
                })
            }

            var effectsMap = {
                add: {
                    apply: function (id, value, revert) {
                        CurrentState.stats.set(id,
                                CurrentState.stats.get(id) + (revert ? -1 * value : value)
                        );
                    },
                    getName: function (value) {
                        return value < 0 ? value : "+" + value;
                    }
                },
                mul: {
                    apply: function (id, value, revert) {
                        CurrentState.stats.set(id,
                            Math.round(CurrentState.stats.get(id) * (revert ? 1 / value : value))
                        );
                    },
                    getName: function (value) {
                        if (value >= 2) {
                            return "x" + value;
                        }
                        value = Math.round((value - 1) * 100);
                        return (value < 0 ? value : "+" + value) + "%";
                    }
                },
                provide: {
                    apply: function (statWrapper, value, revert) {
                        if (revert)
                            CurrentState.stats.remove(statWrapper.id());
                        else
                            CurrentState.stats.set(statWrapper.id(), value);
                    },
                    getName: function (value) {
                        return "+ ";
                    }
                }
            };

            var restrictionsMap = {
                level: {
                    getHint: function (value) {
                        return "Требуемый уровень: " + value;
                    }
                },
                classOnly: {
                    getHint: function (value) {
                        return "Только для классов: " + _.map(value, function (classId) {
                            var clazz = DataSource.getClass(classId);
                            if (clazz) return clazz.name;
                        }).join(", ");
                    }
                },
                classExcept: {
                    getHint: function (value) {
                        var classes = [];
                        _.each(value, function (classId) {
                            var clazz = DataSource.getClass(classId);
                            if (!_.isUndefined(clazz))
                                classes.push(clazz.name)
                        });
                        return "Не для классов: " + classes.join(", ");
                    }
                },
                ultimate: {
                    getHint: function (value) {
                        return "Вы должны купить все доступные вашему классу перки, чтобы открыть этот.";
                    }
                }


            };
        }]
)
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
;
