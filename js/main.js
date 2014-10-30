angular.module('MyModule', [])
    .controller('ClassTree', function ($scope, $http) {

        $scope.hello = "Loading..";
        $scope.currentClass;
        $scope.currentStats;

        $http.get("data/data.json")
            .success(function (json) {
                $scope.data = json;
                $scope.hello = "Ready!";
            })
            .error(function (data, status) {
                $scope.hello = "Failed =(";
                console.error(data + ": " + status);
            });

        $scope.setClass = function (classId, classData) {
            var data = classData;
            data.id = classId;
            $scope.currentClass = data;
            $scope.currentStats = $scope.calculateStats(classId);
        };

        $scope.isSelected = function (classId) {
            return $scope.currentClass !== undefined &&
                (classId === $scope.currentClass.id || $scope.isAncestor(classId, $scope.currentClass));
        };

        $scope.addPerk = function (id) {
            var perk = $scope.getPerk(id);
            if(perk === undefined)
                return;

            $scope.applyPerk(perk);
            perk.selected = !perk.selected;
        };

        /////////////////////

        $scope.applyPerk = function (perk) {
            for(id in perk.effects) {
                $scope.applyPerkEffect(id, perk.effects[id], perk.selected)
            }
        };

        $scope.applyPerkEffect = function (id, stats, revert) {
            for(statId in stats) {
                $scope.effectsMap[id](statId, stats[statId], revert);
            }
        };

        $scope.effectsMap = {
            add: function(stat, value, revert) {
                if($scope.currentStats[stat] !== undefined)
                    $scope.currentStats[stat] += revert ? -1*value : value;
            }
        };

        $scope.isAncestor = function (ancestorId, child) {
            if (ancestorId === undefined || child === undefined)
                return false;
            if (child.parent === ancestorId)
                return true;
            return $scope.isAncestor(ancestorId, $scope.getClass(child.parent));
        };

        $scope.calculateStats = function (classId) {
            var result = {};
            if ($scope.data === undefined || classId === undefined)
                return result;

            return $scope.recursiveCalculateStats(classId, {});
        };

        $scope.recursiveCalculateStats = function (id, result) {
            var clazz = $scope.getClass(id);
            if (clazz === undefined)
                return result;

            var stats = clazz.stats.base;
            for (var key in stats) {
                if (result[key] === undefined)
                    result[key] = stats[key];
            }
            stats = clazz.stats.special;
            for (var key in stats) {
                if (result[key] === undefined)
                    result[key] = stats[key];
            }
            return $scope.recursiveCalculateStats(clazz.parent, result);
        };

        $scope.getClass = function (id) {
            return $scope.getJsonElement("classes", id);
        };

        $scope.getPerk = function (id) {
            return $scope.getJsonElement("perks", id);
        };

        $scope.getJsonElement = function (container, id) {
            var result = jsonPath($scope.data[container], "$.." + id);
            return  result === undefined || result.length == 0 ? undefined : result[0];
        }
    });