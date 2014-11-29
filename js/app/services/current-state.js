angular.module('srms.sof.current-state', [])

    // Some json utils
    .factory('CurrentState', ['statsToArrayFilter', 'DataSource', function (statsToArray, DataSource) {

        var currentClass;
        var selectedPerks = [];

        var statsArray = [];
        var statsCache = {};

        var perksCost = 0;

        function idComparator(id) {
            return function (item) {
                return item.id === id;
            }
        }

        function findStat(id, stats) {
            // если стат уже в кэше, вернем его
            if (statsCache[id])
                return statsCache[id];

            // поищем по id
            var result = _.find(stats, idComparator(id));
            if (result) {
                // добавим в кэш
                statsCache[id] = result;
                return result;
            }

            // пройдемся по составным статам
            _.find(stats, function (item) {
                if (_.isObject(item.value)) {
                    result = findStat(id, item.value);
                    return result;
                }
                return false;
            });

            return result;
        }

        // class section
        function addSpecialStats(stats, result) {
            _.each(stats, function (value, id) {
                if (!_.has(result, id))
                    result[id] = stats[id];
                else if (_.isObject(value))
                    addSpecialStats(value, result[id]);
            });
        }

        function calculateStats(classId, result) {
            // initialize result at the first call
            if (_.isUndefined(result))
                result = {};

            var clazz = DataSource.getClass(classId);
            if (!clazz)
                return result;

            // base stats can't be complex
            _.each(clazz.stats.base, function (value, id) {
                if (!_.has(result, id))
                    result[id] = value;
            });

            // special stats can be complex
            addSpecialStats(clazz.stats.special, result);

            return calculateStats(clazz.parent, result);
        }

        function resetStats(stats) {
            // reset cache
            statsCache = {};
            // convert object of stats into array of stats with sorting order
            statsArray = statsToArray(stats);
        }

        // public section

        return {

            // cost
            cost: {
                get: function () {
                    return currentClass.price + perksCost;
                }
            },

            // class
            clazz: {
                get: function () {
                    return currentClass;
                },
                id: function () {
                    return currentClass && currentClass._id;
                },
                set: function (id) {
                    currentClass = DataSource.getClass(id);
                    resetStats(calculateStats(id));
                },
                stats: function (id) {
                    return calculateStats(id);
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
                    perksCost += DataSource.getPerk(id).price;
                },
                remove: function (id) {
                    selectedPerks = _.without(selectedPerks, id);
                    perksCost -= DataSource.getPerk(id).price;
                },
                isSelected: function (id) {
                    return _.contains(selectedPerks, id);
                }
            },

            // stats
            stats: {
                get: function (id) {
                    return id ? findStat(id, statsArray).value : statsArray
                },
                set: function (id, value) {
                    var stat = findStat(id, statsArray);
                    if (stat)
                        stat.value = value;
                    // add value
                    else
                        statsArray.push({
                            id: id,
                            value: value,
                            order: DataSource.getStat(id).order
                        })
                },
                reset: function (stats) {
                    resetStats(stats)
                },
                remove: function (id) {
                    statsArray = _.reject(statsArray, idComparator(id));
                    delete statsCache[id];
                }
            }
        }
    }]);