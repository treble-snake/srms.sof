angular.module('srms.sof')
    .controller('AccountCtrl',
    ['DataSource', 'CurrentUser', 'CurrentState', 'PerksHelper', 'Confirmation', '$routeParams', '$modal',
        function (DataSource, CurrentUser, CurrentState, PerksHelper, Confirmation, $routeParams, $modal) {

            var ctrl = this;
            var currentTab;

            this.error = "Вас тут быть не должно. За вами выехали.";
            this.getUser = CurrentUser.getUser;
            this.getCurrentTab = function () {
                return currentTab
            };

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

            this.deleteBuild = function () {
                sellDeleteBuild('удалить', function () {
                    DataSource.deleteBuild(currentTab._id);
                    ctrl.builds = _.without(ctrl.builds, currentTab);
                })
            };

            this.sellBuild = function () {
                sellDeleteBuild('продать', function () {
                    DataSource.sellBuild(currentTab._id);
                    CurrentState.reset();
                    CurrentState.clazz.set('base');
                })
            };

            this.editBuild = function () {
                ctrl.addBuild(currentTab.name);
            };

            this.addBuild = function (currentName) {

                var modalInstance = $modal.open({
                    templateUrl: 'js/app/partials/forms/add.build.html',
                    controller: function (builds, currentName, $scope) {
                        $scope.itemsQty = builds.length;
                        $scope.editMode = (currentName !== undefined);
                        if (currentName)
                            $scope.buildName = currentName;

                        this.submitForm = function () {
                            var newName = $scope.buildName;
                            if (_.findWhere(builds, {name: newName}))
                                alert("Уже есть");
                            else
                                $scope.$close(newName)
                        }
                    },
                    controllerAs: "ctrl",
                    resolve: {
                        builds: function () {
                            return ctrl.builds
                        },
                        currentName: function () {
                            return currentName;
                        }
                    }
                });

                modalInstance.result.then(function (result) {
                    (currentName ?
                        DataSource.editBuild({id: currentTab._id, name: result}).then(function () {
                            currentTab.name = result;
                        }) :
                        DataSource.addBuild(result).then(function (response) {
                            console.warn(response);
                            ctrl.builds
                                .push({_id: response.data._id, "name": result, "active": true,
                                    "class": response.data.class, "perks": []})
                        })
                        ).catch(function (e) {
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
            function sellDeleteBuild(actionName, callback) {
                var price = Math.round(CurrentState.cost.get() / 2);
                Confirmation.open('Вы уверены, что хотите ' + actionName + ' "' + currentTab.name + '"?',
                        'С продажи имплатнов и аугментаций вы получите $' + price + '.').then(function () {
                        callback();
                        CurrentUser.updateMoney(price);
                    });
            }

            function initBuilds() {
                DataSource.getBuilds().then(function (response) {
                    ctrl.builds = response || [];
                    if (ctrl.builds.length > 0)
                        ctrl.builds[0].active = true;
                });
            }

            initBuilds();
        }]);