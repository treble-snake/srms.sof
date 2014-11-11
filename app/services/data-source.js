angular.module('srms.sof.data-source', [])

    // Some json utils
    .factory('DataSource', ['$http', function ($http) {

        var data = {};
        const path = "data/data.json";

        // load data
        $http.get(path)
            .success(function (json) {
                data = json;
//                $scope.appStatus = "Готов!";
//                $scope.setClass('base', json.classes['base']);
            })
            .error(function (data, status) {
//                $scope.appStatus = "Обломинго =(";
                console.error(data + ": " + status);
            });



        return {
            data: data,
            getAll: function() {
                return data;
            }
        };
    }]);