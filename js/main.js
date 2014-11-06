var sofApp = angular.module('SrmsSof', ['ui.bootstrap']);

sofApp
    .directive('statsPane', function (RecursionHelper) {
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
    })
    .controller('ClassTree', function ($scope, $http) {

        /* Public section */
        $scope.hello = "Loading..";
        $scope.currentClass;
        $scope.currentStats;
        $scope.selectedPerks = [];
        $scope.version = "0.2.1";

        // load data
        $http.get("data/data.json")
            .success(function (json) {
                $scope.data = json;
                $scope.hello = "Ready!";
                $scope.setClass('base', json.classes['base']);
            })
            .error(function (data, status) {
                $scope.hello = "Failed =(";
                console.error(data + ": " + status);
            });

        $scope.setClass = function (classId, classData) {
            if (!$scope.isClassAvailable(classId))
                return;
            var data = classData;
            data.id = classId;
            $scope.currentClass = data;
            $scope.currentStats = calculateStats(classId);
            applyPerks();
        };

        $scope.isClassSelected = function (classId) {
            return classId === $scope.currentClass.id;
        };

        $scope.isClassAvailable = function (classId) {
            return _.isEqual(classId, 'base') ||
                $scope.isClassSelected(classId) ||
                getClass(classId).parent == $scope.currentClass.id ||
                isAncestor(classId, $scope.currentClass);
        };

        $scope.isPerkAvailable = function (perk) {
            var current = $scope.currentClass;
            var need = perk.for;
            if (current.level < need.level)
                return false;

            if (!_.isEmpty(need.classOnly)
                && !_.contains(need.classOnly, current.id))
                return false;

            if (!_.isEmpty(need.classExcept)
                && _.contains(need.classExcept, current.id))
                return false;

            if(!_.isUndefined(perk.parent) && !_.contains($scope.selectedPerks, perk.parent))
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
            if(!perk.selected)
                $scope.selectedPerks = _.without($scope.selectedPerks, id);
        };

        // TODO use templates
        $scope.getClassDescription = function (classId, clazz) {
            var result = $('<section class="tree-tooltip"></section>');
            result.append('<h1>' + clazz.name + '</h1>');
            result.append('<p class="desc">' + clazz.desc + '</p>');
            result.append('<h2>Характеристики</h2>');

            appendTooltipStats(calculateStats(classId), result);

            return result.wrap("<div/>").parent().html();
        };

        /* Private section */

        function appendTooltipStats(stats, parent) {
            _.each(stats, function (value, id) {
                var statInfo = getStat(id);
                if(!_.isUndefined(statInfo)) {
                    var statText = statInfo.name;

                    if(!_.isObject(value) && !_.isNull(value)) {
                        statText +=  ": " + value;
                        if (!_.isUndefined(statInfo.measure))
                            statText += " " + statInfo.measure;
                    }

                    parent.append('<div class="tooltip-stat">' + statText + '</div>');

                    if(_.isObject(value)) {
                        appendTooltipStats(value, parent.children(".tooltip-stat").last());
                    }
                }
            });

            return parent;
        }

        function applyPerks() {
            _.each($scope.selectedPerks, function(id){
                var perk = getPerk(id);
                perk.selected = false;
                if(!$scope.isPerkAvailable(perk)) {
                    $scope.selectedPerks = _.without($scope.selectedPerks, id);
                    return;
                }
                applyPerk(perk);
                perk.selected = true;
            })
        };

        function applyPerk(perk) {
            _.each(perk.effects, function (stats, id) {
                var applyEffect = effectsMap[id];
                _.each(stats, function (value, id) {
                    applyEffect(getCurrentStatWrapper(id), value, perk.selected);
                })
            })
        }
        var effectsMap = {
                add: function (statWrapper, value, revert) {
                    if (!_.isUndefined(statWrapper))
                        statWrapper.set(statWrapper.get() + (revert ? -1 * value : value));
                },
                mul: function (statWrapper, value, revert) {
                    if (!_.isUndefined(statWrapper))
                        statWrapper.set(
                            Math.round(statWrapper.get() * (revert ? 1 / value : value)));
                },
                provide: function (index, statId, revert) {
                    if (revert)
                        delete $scope.currentStats[statId];
                    else
                        $scope.currentStats[statId] = null;
                }
            }
            ;
        function isAncestor(ancestorId, child) {
           if (_.isUndefined(ancestorId) || _.isUndefined(child))
                return false;
            if (child.parent === ancestorId)
                return true;

            return isAncestor(ancestorId, getClass(child.parent));
        }



        function calculateStats(id, result) {
            if (_.isUndefined(result))
                result = {}

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

        // TODO make it recursive or else
        function getCurrentStatWrapper(id) {
            if (!_.isUndefined($scope.currentStats[id]))
                return {
                    get: function () {
                        return $scope.currentStats[id]
                    },
                    set: function (v) {
                        $scope.currentStats[id] = v
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

            return undefined;
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
            return getJsonElement($scope.data[container], id);
        }

        function getJsonElement(json, id) {
            var result = jsonPath(json, "$.." + id);
            return  _.isEmpty(result) ? undefined : result[0];
        }
    }
)
;
sofApp.factory('RecursionHelper', ['$compile', function ($compile) {
    return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function (element, link) {
            // Normalize the link parameter
            if (angular.isFunction(link)) {
                link = { post: link };
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                pre: (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                post: function (scope, element) {
                    // Compile the contents
                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function (clone) {
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if (link && link.post) {
                        link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}]);