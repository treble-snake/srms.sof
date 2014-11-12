angular.module('srms.sof.current-state', [])

    // Some json utils
    .factory('CurrentState', function () {

        var currentClass;
        var currentStats = {};
        var selectedPerks = [];

        return {
            // class
            getClass: function () {
                return currentClass;
            },
            getClassId: function () {
                return currentClass.id;
            },
            setClass: function (id, clazz) {
                currentClass = clazz;
                currentClass.id = id;
            },

            // perks
            perks: {
                get: function() {
                    return selectedPerks;
                },
                toggle: function(id) {
                    _.contains(selectedPerks, id) ?
                        this.remove(id) : this.add(id);
                },
                add: function(id) {
                    selectedPerks.push(id);
                },
                remove: function(id) {
                    selectedPerks = _.without(selectedPerks, id);
                }
            },

            // stats
            stats: {
                get: function (id) {
                    if (id) {

                        // TODO optimize && make recursive; maybe use cache
                        if (currentStats[id])
                            return currentStats[id];

                        var parentStat = _.find(currentStats, function (value) {
                            return _.isObject(value) && (id in value);
                        });
                        if (parentStat)
                            return parentStat[id];
                    }
                    else
                        return currentStats;

                    return undefined;
                },
                reset: function (stats) {
                    currentStats = stats;
                },
                set: function (id, value) {

                    // TODO optimize && make recursive; maybe use cache
                    if (currentStats[id]) {
                        currentStats[id] = value;
                        return;
                    }

                    _.map(currentStats, function (subValue, subId) {
                        if (_.isObject(subValue) && (id in subValue))
                            subValue[id] = value;

                        return subValue;
                    });
                },
                remove: function (id) {
                    delete currentStats[id];
                }
            }
        }
    });