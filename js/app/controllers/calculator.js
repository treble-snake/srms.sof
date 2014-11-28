angular.module('srms.sof')
    .controller('CalculatorCtrl', ['DataSource',
        function (DataSource) {
            var ctrl = this;
            this.isReady = false;
            this.error = '';

            DataSource.initialize()
                .then(function (promise) {
                    ctrl.isReady = true;
                })
                .catch(function (err) {
                    ctrl.error = "Что-то пошло не так. :(";
                });
        }]);