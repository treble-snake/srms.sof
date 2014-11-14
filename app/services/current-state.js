angular.module('srms.sof.current-state', [])

    // Some json utils
    .factory('CurrentState', ['statsToArrayFilter', 'DataSource', function (statsToArray, DataSource) {

        var currentClass;
        var selectedPerks = [];

        var statsArray = [];
        var statsCache = {};

        return {

            // class
            clazz: {
                get: function () {
                    return currentClass;
                },
                id: function () {
                    return currentClass.id;
                },
                set: function (id, clazz) {
                    currentClass = clazz;
                    currentClass.id = id;
                }
            },

            // perks
            perks: {
                get: function () {
                    return selectedPerks;
                },
                toggle: function (id) {
                    _.contains(selectedPerks, id) ?
                        this.remove(id) : this.add(id);
                },
                add: function (id) {
                    selectedPerks.push(id);
                },
                remove: function (id) {
                    selectedPerks = _.without(selectedPerks, id);
                }
            },

            // stats
            stats: {
                get: function (id) {
                    if (id) {

                        if(statsCache[id])
                            return statsCache[id].value;

                        // TODO make reusable
                        var compareId = function (item) {
                            return item.id === id;
                        };

                        // TODO optimize && make recursive; maybe use cache
                        var result = _.find(statsArray, compareId);
                        if (result) {
                            statsCache[id] = result;
                            return result.value;
                        }

                        _.find(statsArray, function (item) {
                            if(_.isObject(item.value)) {
                                result = _.find(item.value, compareId);
                                if(result)
                                    return true;
                            }
                            return false;
                        });

                        return result.value;
                    }
                    else
                        return statsArray;
                },
                set: function (id, value) {

                    if(statsCache[id]) {
                        statsCache[id].value = value;
                        return;
                    }

                    // TODO make reusable
                    var compareId = function (item) {
                        return item.id === id;
                    };

                    // TODO optimize && make recursive; maybe use cache
                    // change stat value
                    var result = _.find(statsArray, compareId);
                    if (result) {
                        result.value = value;
                        return;
                    }

                    _.find(statsArray, function (item) {
                        if(_.isObject(item.value)) {
                            result = _.find(item.value, compareId);
                            if(result) {
                                result.value = value;
                                return true;
                            }
                        }
                        return false;
                    });

                    // add value
                    if(!result) {
                        statsArray.push({
                            id: id,
                            value: value,
                            order: DataSource.getStat(id).order
                        })
                    }
                },
                reset: function (stats) {
                    // reset cache
                    statsCache = {};
                    // convert object of stats into array of stats with sorting order
                    statsArray = statsToArray(stats);
                },
                remove: function (id) {
                    statsArray = _.reject(statsArray, function (item) {
                        return item.id === id;
                    });
                    delete statsCache[id];
                }
            }
        }
    }]);