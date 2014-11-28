angular.module('srms.sof.data-source', ['srms.sof.utils'])

    .factory('DataSource', ['$q', '$http', 'JsonUtils', function ($q, $http, JsonUtils) {

        var statsCache = {};
        var classesCache = {};
        var perksCache = {};

        function getRequestUrl(controller, action) {
            return "/api.php?controller=" + controller + "&action=" + action;
        }

        function makeRequests(urls, usePost) {
            return $q.all(_.map(urls, function (url) {
                return usePost ?
                    $http.post(url).error(logError) :
                    $http.get(url).error(logError);
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
                    throw new Error("S.R.M.S. Sof: " + item.data['error']);
            });
            return response;
        }

        return {
            // returns a promise to initialize the application asynchronously
            initialize: function () {

                return makeRequests([
                    getRequestUrl("stats", "list"),
                    getRequestUrl("classes", "list"),
                    getRequestUrl("perks", "list")
                ]).then(function (responses) {
                    statsCache = responses[0].data;
                    classesCache = responses[1].data;
                    perksCache = responses[2].data;
                });
            },
            getClasses: function () {
                return classesCache;
            },
            getPerks: function () {
                return perksCache;
            },
            getStatsInfo: function () {
                return statsCache;
            },

            getClass: function (id) {
                return classesCache[id];
            },
            getStat: function (id) {
                return statsCache[id];
            },
            getPerk: function getPerk(id) {
                return perksCache[id];
            },
            getNews: function (tag) {
                var newsQuery = getRequestUrl("news", "list");
                if (tag) newsQuery += "&tag=" + tag;
                return makeRequests([newsQuery, getRequestUrl("news", "tags")])
            },

            getUser: function(data) {
                return makeRequests(
                    [getRequestUrl("users", "auth") + "&data=" + angular.toJson(data)], true)
            },
            addMoney: function() {
                return makeRequests(
                    [getRequestUrl("users", "addMoney")], true)
            }
        }
    }]);