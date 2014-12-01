angular.module('srms.sof')
    .controller('AccountCtrl', ['DataSource', 'CurrentUser', 'CurrentState', 'PerksHelper', '$routeParams', '$location', '$modal',
        function (DataSource, CurrentUser, CurrentState, PerksHelper, $routeParams, $location, $modal) {

            var ctrl = this;
            var currentTab;

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

            this.initTree = function (data) {
                currentTab = data;
                CurrentState.reset();
                CurrentState.clazz.set(data.class);
                if (data.perks) {
                    _.each(data.perks, function (perk) {
                        CurrentState.perks.add(perk);
                    })
                }
                PerksHelper.applyCurrentPerks();
            };

            this.getBuilds = [
//                {
//                    "name": "Петр",
//                    "class": "sniper",
//                    "perks": ["steelSkin"],
//                    "active": true
//                },
//                {
//                    "name": "Семен",
//                    "class": "destroyer-3",
//                    "perks": ["steelSkin", "extraWeapon"]
//                },
//                {
//                    "name": "Авгут",
//                    "class": "medic",
//                    "perks": []
//                }
            ];

            this.addBuild = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'js/app/partials/forms/add.build.html',
                    controller: function (itemsQty, $scope) {
                        $scope.itemsQty = itemsQty;
                    },
                    resolve: {
                        itemsQty: function () {
                            return ctrl.getBuilds.length
                        }
                    }

//                    size: size,
//                    template: 'Олол привет!'
                });

                modalInstance.result.then(function (result) {
                    ctrl.getBuilds.push({"name": result, "active": true, "class": "base", "perks": []})
                }, function () {
                    if(currentTab)
                        currentTab.active = true;
                });
            }
        }]);