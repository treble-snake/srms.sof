angular.module('srms.sof')
    .directive('authPane', [
        function () {
            return {
                templateUrl: 'js/app/partials/auth.html',
                restrict: 'A',
                controller: ['CurrentUser', function (CurrentUser) {
                    this.login = CurrentUser.login;
//                        function() {
//                        CurrentUser.login($scope);
//                    };
                    this.logout = CurrentUser.logout;
                    this.getUser = CurrentUser.getUser;
                }],
                controllerAs: 'ctrl'
            }
        }]);