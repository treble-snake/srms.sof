angular.module('MyModule', [])
    .controller('ClassTree', function ($scope, $http) {

        $scope.hello = "Loading..";
        $scope.currentClass = null;

        $http.get("data/data.json")
            .success(function (json) {
                $scope.data = json;
                $scope.hello = "Ready!";
            })
            .error(function (data, status) {
                $scope.hello = "Failed =(";
                console.error(data + ": " + status);
            });

        $scope.choose = function (classId, classData) {
            var data = classData;
            data.id = classId;
            $scope.currentClass = data;
        };

        $scope.calculateStats = function (classId) {
            var result = {};
            if ($scope.data === undefined || classId === undefined)
                return result;

            return $scope.recursiveCalculateStats(classId, {});
        };

        $scope.recursiveCalculateStats = function(id, result) {

            var clazz = $scope.getClass(id);
            if(clazz === undefined)
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
        }

        $scope.getClass = function(id) {
            var result = jsonPath($scope.data, "$.classes.." + id);
            return  result === undefined || result.length == 0 ? undefined : result[0];
        }
    });