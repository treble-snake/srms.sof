angular.module('srms.sof')
    .controller('AccountCtrl', ['DataSource', 'CurrentUser',  'CurrentState', '$routeParams', '$location', '$modal',
        function (DataSource, CurrentUser, CurrentState, $routeParams, $location, $modal) {

            var ctrl = this;

            // TODO move redirect to logout method
            if (!CurrentUser.getUser())
                $location.url('/about');

            this.error = "Вас тут быть не должно. За вами выехали.";
            this.getUser = CurrentUser.getUser;

            this.addMoney = function () {
                DataSource.addMoney().then(function (response) {
                    CurrentUser.updateMoney(response.data.added);
                });
            };

            this.initTree = function(data, calc) {
                CurrentState.clazz.set(data.class);
                if(data.perks) {
                    _.each(data.perks, function(perk){
                        CurrentState.perks.add(perk);
                    })
                }
            };

            this.getBuilds = [
                {
                    "name": "Петр",
                    "class": "sniper",
                    "perks": ["steelSkin"],
                    "active": true
                },
                {
                    "name": "Семен",
                    "class": "destroyer-2",
                    "perks": ["steelSkin", "grenade"]
                },
                {
                    "name": "Авгут",
                    "class": "medic",
                    "perks": []
                }
            ];

            this.addBuild = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'js/app/partials/forms/add.build.html'
//                    template: 'Олол привет!'
//                    controller: 'ModalInstanceCtrl',
//                    size: size,
//                    resolve: {
//                        items: function () {
//                            return $scope.items;
//                        }
//                    }
                });

                modalInstance.result.then(function (result) {
                    ctrl.getBuilds.push({"name": result, "active": true, "class": "base", "perks": []})
                }, function () {
                    ctrl.getBuilds[ctrl.getBuilds.length - 1].active = true;
                });
            }
        }]);