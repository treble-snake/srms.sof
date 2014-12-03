angular.module('srms.sof')
    .factory('CurrentUser', ['$http', '$location', 'DataSource',
        function ($http, $location, DataSource) {

            var user = undefined;

            function unsetUser() {
                user = undefined;
            }

            function authCallback(vkResponse) {
                if (vkResponse.session) {
                    DataSource.getUser(vkResponse.session)
                        .then(function (response) {
                            user = response.data;
                        });
                }
                else
                    unsetUser();
            }

            return {
                login: function () {
                    VK.Auth.login(authCallback)
                },
                logout: function () {
                    VK.Auth.logout();
                    unsetUser();

                    if ($location.path().substring(1).indexOf('account') === 0)
                        $location.url('/about');
                },
                init: function () {
                    VK.Auth.getLoginStatus(authCallback)
                },
                getUser: function () {
                    return user;
                },
                updateMoney: function (add) {
                    if (user)
                        user.money += add;
                }
            }
        }]);