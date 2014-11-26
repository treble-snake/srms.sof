angular.module('srms.sof.data-source', ['srms.sof.utils'])

    .factory('DataSource', ['$q', '$http', 'JsonUtils', function ($q, $http, JsonUtils) {

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
            if (element) {
                cache[container][id] = element;
            }

            return element;
        }

        function logError(data, status) {
            console.error("S.R.M.S. Sof: Data source error: " + data + ": " + status);
        }

        function checkResponse(response) {
            if(!_.isArray(response))
                response = [response];

            _.each(response, function(item){
                if(item.data['error'])
                    throw new Error(item.data['error']);
            });

            return response;
        }

        return {
            // returns a promise to initialize the application asynchronously
            initialize: function () {
                return $http.get(DATA_PATH)
                    .success(function (json) {
                        data = json;
                    }).error(logError);
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
            getNews: function (tag) {
                var newsQuery = "/api.php?controller=news&action=list";
                if (tag) newsQuery += "&tag=" + tag;
                return $q.all([
                    $http.get(newsQuery).error(logError),
                    $http.get("/api.php?controller=news&action=tags").error(logError)
                ]).then(checkResponse);
            }
        }
    }]);