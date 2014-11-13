angular.module('srms.sof.current-state', [])

    // Some json utils
    .factory('CurrentState', ['sortStatsFilter', 'DataSource', function (sortStats, DataSource) {

        var currentClass;
        var currentStats = {};
        var selectedPerks = [];
        var currentStatsIndex = [];
        var stats2 = [];

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
                index: function() {
                    return currentStatsIndex;
                },
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
                    return stats2;
//                        return currentStats;

                    return undefined;
                },
                reset: function (stats) {
                    currentStats = stats;
                    currentStatsIndex = sortStats(_.keys(stats));

                    stats2 = _.map(stats, function(value, key){
                        var statInfo = DataSource.getStat(key);
                        if(value.sub) {
                            // TODO recursion
                            value.sub =  _.map(stats, function(subValue, subKey){
                                var statInfo = DataSource.getStat(subKey);
                                return {
                                    id: subKey,
                                    value: subValue,
                                    order: statInfo.order ? statInfo.order : 9999
                                }
                            });
                        }
                        return {
                            id: key,
                            value: value,
                            order: statInfo.order ? statInfo.order : 9999
                        }
                    })
                },
                set: function (id, value) {

                    return;

                    // TODO optimize && make recursive; maybe use cache
                    // change stat value
                    if (currentStats[id]) {
                        currentStats[id] = value;
                        return;
                    }

                    // change substat value
                    var found = false;
                    _.map(currentStats, function (subValue, subId) {
                        if (_.isObject(subValue) && (id in subValue)) {
                            subValue[id] = value;
                            found = true;
                        }

                        return subValue;
                    });

                    // add value
                    if(!found) {
                        currentStats[id] = value;
                        // TODO ?
                        var tmpIndex = currentStatsIndex;
                        tmpIndex.push(id);
                        currentStatsIndex = sortStats(tmpIndex);
                    }
                },
                remove: function (id) {
                    return;
                    currentStatsIndex = _.without(currentStatsIndex, id);
                    delete currentStats[id];
                }
            }
        }
    }]);