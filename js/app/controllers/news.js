angular.module('srms.sof')
    .controller('NewsCtrl', ['DataSource', 'CommonUtils', '$routeParams',
        function (DataSource, CommonUtils, $routeParams) {

            var ctrl = this;
            var ALL_TAG = "all";

            // public section

            this.news = [];
            this.tags = [];
            this.isReady = false;
            this.error = '';
            this.tag = $routeParams.tag === ALL_TAG ? undefined : $routeParams.tag;

            this.getTag = function (id) {
                return _.find(ctrl.tags, CommonUtils.idComparator(id));
            };

            this.formatDate = CommonUtils.formatMongoDate;

            // private section

            function initTag() {
                ctrl.tag = ctrl.getTag(ctrl.tag);
            }

            // initialize
            DataSource.getNews(this.tag)
                .then(function (responses) {
                    ctrl.tags = responses[1].data;
                    ctrl.news = responses[0].data;
                    ctrl.isReady = true;
                    if (ctrl.tag) initTag();
                })
                .catch(function () {
                    ctrl.error = 'Что-то пошло не так :(';
                })
        }]);