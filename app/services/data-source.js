angular.module('srms.sof.data-source', ['srms.sof.utils'])

    .factory('DataSource', ['$http', 'JsonUtils', function ($http, JsonUtils) {

        var DATA_PATH = "data/data.json";
        var CLASSES_ELEMENT_ID = "classes";
        var PERKS_ELEMENT_ID = "perks";
        var STATS_ELEMENT_ID = "stats";

        var data = {};

        var cache = {};
        // init cache
        cache[CLASSES_ELEMENT_ID] = {};
        cache[PERKS_ELEMENT_ID] = {};
        cache[STATS_ELEMENT_ID] = {};

        function getDataElement(container, id) {
            if (data[container][id])
                return data[container][id];

            if (cache[container][id])
                return cache[container][id];

            var element = JsonUtils.getJsonElement(data[container], id);
            if(element) {
                cache[container][id] = element;
            }

            return element;
        }

        return {
            // returns a promise to initialize the application asynchronously
            initialize: function () {
                return $http.get(DATA_PATH)
                    .success(function (json) {
                        data = json;
                    })
                    .error(function (data, status) {
                        console.error("S.R.M.S. Sof: Data source error: " + data + ": " + status);
                    });
            },

            getClasses: function () {
                return data[CLASSES_ELEMENT_ID];
            },
            getPerks: function () {
                return data[PERKS_ELEMENT_ID];
            },
            getStatsInfo: function () {
                return data[STATS_ELEMENT_ID];
            },

            getClass: function (id) {
                return getDataElement(CLASSES_ELEMENT_ID, id);
            },
            getStat: function (id) {
                return getDataElement(STATS_ELEMENT_ID, id);
            },
            getPerk: function getPerk(id) {
                return getDataElement(PERKS_ELEMENT_ID, id);
            },
            getNews: function() {
                return $http.get("data/news.json")
                    .error(function (data, status) {
                        console.error("S.R.M.S. Sof: Data source error: " + data + ": " + status);
                    });
            }
        }
    }]);