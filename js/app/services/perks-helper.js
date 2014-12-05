angular.module('srms.sof')
    .factory('PerksHelper', ['CurrentState', 'DataSource', 'CurrentUser',
        function (CurrentState, DataSource, CurrentUser) {

        var effectsMap = {
            add: {
                apply: function (id, value, revert) {
                    CurrentState.stats.set(id,
                        parseFloat((CurrentState.stats.get(id) + (revert ? -1 * value : value)).toFixed(1))
                    );
                },
                getName: function (value) {
                    return value < 0 ? value : "+" + value;
                }
            },
            mul: {
                apply: function (id, value, revert) {
                    CurrentState.stats.set(id,
                        Math.round(CurrentState.stats.get(id) * (revert ? 1 / value : value))
                    );
                },
                getName: function (value) {
                    if (value >= 2) {
                        return "x" + value;
                    }
                    value = Math.round((value - 1) * 100);
                    return (value < 0 ? value : "+" + value) + "%";
                }
            },
            provide: {
                apply: function (id, value, revert) {
                    if (revert)
                        CurrentState.stats.remove(id);
                    else
                        CurrentState.stats.set(id, value);
                },
                getName: function (value) {
                    return "+ ";
                }
            }
        };

        var restrictionsMap = {
            level: {
                getHint: function (value) {
                    return "Требуемый уровень: " + value;
                }
            },
            classOnly: {
                getHint: function (value) {
                    return "Только для классов: " + _.map(value, function (classId) {
                        var clazz = DataSource.getClass(classId);
                        if (clazz) return clazz.name;
                    }).join(", ");
                }
            },
            classExcept: {
                getHint: function (value) {
                    var classes = [];
                    _.each(value, function (classId) {
                        var clazz = DataSource.getClass(classId);
                        if (!_.isUndefined(clazz))
                            classes.push(clazz.name)
                    });
                    return "Не для классов: " + classes.join(", ");
                }
            },
            ultimate: {
                getHint: function (value) {
                    return "Вы должны купить все доступные вашему классу перки, чтобы открыть этот.";
                }
            }
        };

        function applyEffectOnStats(stats, effect, revert) {
            _.each(stats, function (value, id) {
                if (_.isObject(value))
                    applyEffectOnStats(value, effect, revert);
                else
                    effect.apply(id, value, revert);
            })
        }

        return {

            getHint: function (id, value) {
                return restrictionsMap[id].getHint(value)
            },

            getEffect: function (id) {
                return effectsMap[id];
            },

            applyPerk: function (perk, selected) {
                _.each(perk.effects, function (stats, id) {
                    applyEffectOnStats(stats, effectsMap[id], !selected)
                })
            },

            applyCurrentPerks: function () {
                var self = this;
                _.each(CurrentState.perks.get(), function (id) {
                    var perk = DataSource.getPerk(id);
                    if (!self.isPerkAvailable(id)) {
                        CurrentState.perks.remove(id);
                        return;
                    }
                    self.applyPerk(perk, true);
                })
            },

            isPerkAvailable: function (id) {
                var perk = DataSource.getPerk(id);
                var current = CurrentState.clazz.get();
                var need = perk.for;

                if (current.level < need.level)
                    return false;

                if (!_.isEmpty(need.classOnly)
                    && !_.contains(need.classOnly, current.id))
                    return false;

                if (!_.isEmpty(need.classExcept)
                    && _.contains(need.classExcept, current.id))
                    return false;

                if (!_.isUndefined(perk.parent) && !_.contains(CurrentState.perks.get(), perk.parent))
                    return false;

                return true;
            },

            isAffordable: function(id) {
                return DataSource.getPerk(id).price <= CurrentUser.getUser().money
            }
    }
}])
;