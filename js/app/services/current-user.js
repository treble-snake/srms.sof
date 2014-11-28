angular.module('srms.sof')
    .factory('CurrentUser', ['$http', 'DataSource', function ($http, DataSource) {

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
            },
            init: function () {
                VK.Auth.getLoginStatus(authCallback)
            },
            getUser: function () {
                return user;
            },
            updateMoney: function(add) {
                if(user)
                    user.money += add;
            }
        }
    }]);