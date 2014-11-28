angular.module('srms.sof')
    .controller('AccountCtrl', ['DataSource', 'CurrentUser', '$routeParams', '$location',
        function (DataSource, CurrentUser, $routeParams, $location) {

            var ctrl = this;

            if(!CurrentUser.getUser())
                $location.url('/about')

            this.error = "Вас тут быть не должно. За вами выехали.";
            this.getUser = CurrentUser.getUser;

            this.addMoney = function(){
                DataSource.addMoney().then(function(response){
                    CurrentUser.updateMoney(response.data.added);
                });

            }
        }]);