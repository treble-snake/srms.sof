var sofApp = angular.module('srms.sof.calculator',
    ['ui.bootstrap', 'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source']);

sofApp
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

    .controller('CalculatorCtrl', ['$scope', function ($scope) {
        $scope.appStatus = "Загрузка..";
        this.version = "0.2.5";
    }])

    .controller('PerksCtrl', [function () {

    }])
    .controller('ClassesCtrl', [function () {

    }])

    .controller('ClassTree', [
        '$scope', '$http', 'JsonUtils', 'CurrentState', 'DataSource',
        function ($scope, $http, JsonUtils, CurrentState, DataSource) {

            /* Public section */

            $scope.currentStats;
            $scope.selectedPerks = [];


            $scope.data = DataSource.data;
//            $scope.setClass('base', json.classes['base']);



//            // load data
//            $http.get("data/data.json")
//                .success(function (json) {
//                    $scope.data = json;
//                    $scope.appStatus = "Готов!";
//                    $scope.setClass('base', json.classes['base']);
//                })
//                .error(function (data, status) {
//                    $scope.appStatus = "Обломинго =(";
//                    console.error(data + ": " + status);
//                });

            $scope.getCurrentClass = function () {
                return CurrentState.getClass();
            };

            $scope.setClass = function (classId, classData) {
                if (!$scope.isClassAvailable(classId))
                    return;
                CurrentState.setClass(classId, classData);
                $scope.currentStats = calculateStats(classId);
                applyPerks();
            };

            $scope.isClassSelected = function (classId) {
                return classId === CurrentState.getClassId();
            };

            $scope.isClassAvailable = function (classId) {
                return _.isEqual(classId, 'base') ||
                    $scope.isClassSelected(classId) ||

                    getClass(classId).parent == CurrentState.getClassId() ||
                    isAncestor(classId, CurrentState.getClass());
            };

            $scope.isPerkAvailable = function (perk) {
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

                if (!_.isUndefined(perk.parent) && !_.contains($scope.selectedPerks, perk.parent))
                    return false;

                return true;
            };

            $scope.addPerk = function (id) {
                var perk = getPerk(id);
                if (_.isUndefined(perk) || !$scope.isPerkAvailable(perk))
                    return;

                applyPerk(perk);
                $scope.selectedPerks.push(id);
                perk.selected = !perk.selected;
                if (!perk.selected)
                    $scope.selectedPerks = _.without($scope.selectedPerks, id);
            };

            // TODO use templates
            $scope.getClassTooltip = function (classId, clazz) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + clazz.name + '</h1>');
                result.append('<p class="desc">' + clazz.desc + '</p>');
                result.append('<h2>Характеристики</h2>');
                appendTooltipStats(calculateStats(classId), result);

                return result.wrap("<div/>").parent().html();
            };

            // TODO use templates
            $scope.getPerkTooltip = function (perkId, perk) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + perk.name + '</h1>');
                result.append('<p class="desc">' + perk.desc + '</p>');
                result.append('<h2>Характеристики</h2>');

                _.each(perk.effects, function (stats, effectId) {
                    var effect = effectsMap[effectId];
                    _.each(stats, function (statValue, statId) {
                        var statText =
                            effect.getName(statValue) + " " + getStat(statId).name
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

            function appendTooltipStats(stats, parent) {
                _.each(stats, function (value, id) {
                    var statInfo = getStat(id);
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

            function applyPerks() {
                _.each($scope.selectedPerks, function (id) {
                    var perk = getPerk(id);
                    perk.selected = false;
                    if (!$scope.isPerkAvailable(perk)) {
                        $scope.selectedPerks = _.without($scope.selectedPerks, id);
                        return;
                    }
                    applyPerk(perk);
                    perk.selected = true;
                })
            }

            function applyPerk(perk) {
                _.each(perk.effects, function (stats, id) {
                    var effect = effectsMap[id];
                    _.each(stats, function (value, id) {
                        effect.apply(getCurrentStatWrapper(id), value, perk.selected);
                    })
                })
            }

            var effectsMap = {
                add: {
                    apply: function (statWrapper, value, revert) {
                        if (!_.isUndefined(statWrapper))
                            statWrapper.set(statWrapper.get() + (revert ? -1 * value : value));
                    },
                    getName: function (value) {
                        return value < 0 ? value : "+" + value;
                    }
                },
                mul: {
                    apply: function (statWrapper, value, revert) {
                        if (!_.isUndefined(statWrapper))
                            statWrapper.set(
                                Math.round(statWrapper.get() * (revert ? 1 / value : value)));
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
                            delete $scope.currentStats[statWrapper.id()];
                        else
                            $scope.currentStats[statWrapper.id()] = value;
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
                            var clazz = getClass(classId);
                            if (clazz) return clazz.name;
                        }).join(", ");
                    }
                },
                classExcept: {
                    getHint: function (value) {
                        var classes = [];
                        _.each(value, function (classId) {
                            var clazz = getClass(classId);
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

            function isAncestor(ancestorId, child) {
                if (_.isUndefined(ancestorId) || _.isUndefined(child))
                    return false;
                if (child.parent === ancestorId)
                    return true;

                return isAncestor(ancestorId, getClass(child.parent));
            }


            function calculateStats(id, result) {
                if (_.isUndefined(result))
                    result = {};

                var clazz = getClass(id);
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

            // TODO make it recursive or like that
            function getCurrentStatWrapper(id) {
                if (!_.isUndefined($scope.currentStats[id]))
                    return {
                        get: function () {
                            return $scope.currentStats[id]
                        },
                        set: function (v) {
                            $scope.currentStats[id] = v
                        },
                        id: function () {
                            return id;
                        }
                    };

                for (var i in $scope.currentStats) {
                    var statData = $scope.currentStats[i];
                    if (_.isEmpty(statData))
                        continue;

                    for (var subId in statData) {
                        if (subId == id) {
                            return {
                                get: function () {
                                    return $scope.currentStats[i][subId]
                                },
                                set: function (v) {
                                    $scope.currentStats[i][subId] = v
                                }
                            }
                        }
                    }
                }

                return {
                    get: function () {
                    },
                    set: function (v) {
                    },
                    id: function () {
                        return id;
                    }
                };
            }

            function getStat(id) {
                return getDataJsonElement("stats", id);
            }

            function getClass(id) {
                return getDataJsonElement("classes", id);
            }

            function getPerk(id) {
                return getDataJsonElement("perks", id);
            }

            function getDataJsonElement(container, id) {
                return JsonUtils.getJsonElement($scope.data[container], id);
            }

        }]
);
