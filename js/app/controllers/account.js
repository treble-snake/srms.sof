angular.module('srms.sof')
    .controller('AccountCtrl', ['DataSource', 'CurrentUser', 'CurrentState', 'PerksHelper', '$routeParams', '$modal',
        function (DataSource, CurrentUser, CurrentState, PerksHelper, $routeParams, $modal) {

            var ctrl = this;
            var currentTab;

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

            this.builds = [];

            this.addBuild = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'js/app/partials/forms/add.build.html',
                    controller: function (builds, $scope) {
                        $scope.itemsQty = builds.length;

                        this.submitForm = function() {
                            var newName = $scope.buildName;
                            if(_.findWhere(builds, {name: newName}))
                                alert("Уже есть");
                            else
                                $scope.$close(newName)
                        }
                    },
                    controllerAs: "ctrl",
                    resolve: {
                        builds: function () {
                            return ctrl.builds
                        }
                    }
                });

                modalInstance.result.then(function (result) {
                    DataSource.addBuild(result)
                        .then(function () {
                            ctrl.builds
                                .push({"name": result, "active": true, "class": "base", "perks": []})
                        })
                        .catch(function (e) {
                            alert(e.message);
                            if (currentTab)
                                currentTab.active = true;
                        });
                }, function () {
                    if (currentTab)
                        currentTab.active = true;
                });
            };

            // private section
            function initBuilds() {
                DataSource.getBuilds().then(function (response) {
                    ctrl.builds = response || [];
                    if(ctrl.builds.length > 0)
                        ctrl.builds[0].active = true;
                });
            }

            initBuilds();
        }]);