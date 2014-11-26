angular.module('srms.sof.data-source', ['srms.sof.utils'])

    .factory('DataSource', ['$q', '$http', 'JsonUtils', function ($q, $http, JsonUtils) {

        //@Deprecated
        var DATA_PATH = "data/data.json";
        var CLASSES_ELEMENT_ID = "classes";
        var PERKS_ELEMENT_ID = "perks";

        //@Deprecated
        var data = {};

        var cache = {};
        // init cache
        cache[CLASSES_ELEMENT_ID] = {};
        cache[PERKS_ELEMENT_ID] = {};

        // new
        var stats = {};
        var classes = {};
        //-------

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

        function getUrl(controller, action) {
            return "/api.php?controller=" + controller + "&action=" + action;
        }

        function makeRequests(urls) {
            return $q.all(_.map(urls, function (url) {
                return $http.get(url).error(logError);
            })).then(checkResponse);
        }

        function logError(data, status) {
            console.error("S.R.M.S. Sof: Data source error: " + data + ": " + status);
        }

        function checkResponse(response) {
            if (!_.isArray(response))
                response = [response];

            _.each(response, function (item) {
                if (item.data['error'])
                    throw new Error(item.data['error']);
            });

            return response;
        }

        return {
            // returns a promise to initialize the application asynchronously
            initialize: function () {

                return makeRequests([
                    getUrl("stats", "list"),
                    getUrl("classes", "list"),
                    getUrl("perks", "list"),
                    DATA_PATH
                ]).then(function (responses) {
                    console.info(responses);

                    stats = responses[0].data;
                    console.info(stats);

                    classes = responses[1].data;
                    console.info(classes);

                    data = responses[3].data;
                });
            },

            getClasses: function () {
                return data[CLASSES_ELEMENT_ID];
            },
            getPerks: function () {
                return data[PERKS_ELEMENT_ID];
            },
            getStatsInfo: function () {
                return stats;
            },

            getClass: function (id) {
                return getDataElement(CLASSES_ELEMENT_ID, id);
            },
            getStat: function (id) {
                return stats[id];
            },
            getPerk: function getPerk(id) {
                return getDataElement(PERKS_ELEMENT_ID, id);
            },
            getNews: function (tag) {
                var newsQuery = getUrl("news", "list");
                if (tag) newsQuery += "&tag=" + tag;
                return makeRequests([newsQuery, getUrl("news", "tags")])
            }
        }
    }]);