angular.module('srms.sof',
    ['ui.bootstrap', 'ngRoute', 'ngAnimate',
        'srms.sof.utils', 'srms.sof.current-state', 'srms.sof.data-source'])

    .controller('AppCtrl', ['$location', function ($location) {
        this.version = "0.5.2";

        this.pages = [
            {url: 'contracts', name: 'Контракты'},
            {url: 'mercenaries', name: 'Наемники'},
            {url: 'implants', name: 'Импланты'},
            {url: 'corporations', name: 'Корпорации'},
            {url: 'news', name: 'Новости'},
            {url: 'about', name: 'О проекте'}
        ];

        this.isCurrentPage = function (url) {
            return  $location.path().substring(1).indexOf(url) === 0;
        }
    }])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/news'
            })
            .when('/about', {
                templateUrl: 'app/views/about.html'
            })
            .when('/implants', {
                templateUrl: 'app/views/calculator.html',
                controller: 'CalculatorCtrl',
                controllerAs: 'calculator'
            })
            .when('/corporations', {
                templateUrl: 'app/views/corporations.html',
                controller: 'CorporationsCtrl'
            })
            .when('/news', {
                redirectTo: '/news/all'
            })
            .when('/news/:tag', {
                templateUrl: 'app/views/news.html',
                controller: 'NewsCtrl',
                controllerAs: 'ctrl'
            })
            .otherwise({
                templateUrl: 'app/views/empty.html'
            })
    })

    .controller('StatsCtrl', [
        '$scope', 'CurrentState', 'DataSource',
        function ($scope, CurrentState, DataSource) {
            this.getStatsInfo = DataSource.getStatsInfo;
            this.getStatValues = CurrentState.stats.get;
            this.getCurrentClass = CurrentState.clazz.get;
            this.getCost = CurrentState.cost.get;
        }])
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
        }])
    .controller('NewsCtrl', ['DataSource', 'DateHelper', '$routeParams',
        function (DataSource, DateHelper, $routeParams) {

            var ctrl = this;
            var ALL_TAG = "all";

            // public section
            this.news = [];
            this.tags = [];
            this.isReady = false;
            this.error = '';
            this.tag = $routeParams.tag === ALL_TAG ? undefined : $routeParams.tag;

            this.getTag = function (code) {
                return _.find(ctrl.tags, function (item) {
                    return code === item._id
                });
            };

            this.formatDate = DateHelper.format;

            // private section
            function initTag() {
                ctrl.tag = ctrl.getTag(ctrl.tag);
            }

            DataSource.getNews()
                .then(function (responses) {
                    ctrl.tags = responses[1].data;
                    ctrl.news = ctrl.tag ?
                        _.filter(responses[0].data, function (item) {
                            return _.contains(item.tags, ctrl.tag);
                        }) : responses[0].data;
                    ctrl.isReady = true;
                    if (ctrl.tag)
                        initTag();
                })
                .catch(function () {
                    ctrl.error = 'Что-то пошло не так :(';
                })
        }])
;