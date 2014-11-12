angular.module('srms.sof.calculator')
    .controller('PerksCtrl', [
        '$scope', '$rootScope', 'CurrentState', 'DataSource',
        function ($scope, $rootScope, CurrentState, DataSource) {

            var ctrl = this;

            /* Public section */
            this.getAllPerks = DataSource.getPerks;

            this.isPerkAvailable = function (perk) {
                var current = CurrentState.getClass();
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
            };

            this.addPerk = function (id) {
                var perk = DataSource.getPerk(id);
                if (!perk || !ctrl.isPerkAvailable(perk))
                    return;

                applyPerk(perk);
                CurrentState.perks.toggle(id);
                perk.selected = !perk.selected;
            };

            // TODO use templates
            this.getPerkTooltip = function (perkId, perk) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + perk.name + '</h1>');
                result.append('<p class="desc">' + perk.desc + '</p>');
                result.append('<h2>Характеристики</h2>');

                _.each(perk.effects, function (stats, effectId) {
                    var effect = effectsMap[effectId];
                    _.each(stats, function (statValue, statId) {
                        var statText =
                            effect.getName(statValue) + " " + DataSource.getStat(statId).name
                        result.append('<div class="tooltip-stat">' + statText + '</div>');
                    });
                });

                result.append('<h2>Требования</h2>');
                _.each(perk.for, function (value, id) {
                    result.append('<div class="tooltip-stat">' +
                        restrictionsMap[id].getHint(value) + '</div>');
                });

                return result.wrap("<div/>").parent().html();
            };

            /* Private section */

            // TODO move to a service
            $rootScope.applyPerks = function () {
                _.each(CurrentState.perks.get(), function (id) {
                    var perk = DataSource.getPerk(id);
                    if (!ctrl.isPerkAvailable(perk)) {
                        perk.selected = false;
                        CurrentState.perks.remove(id);
                        return;
                    }
                    applyPerk(perk);
                    perk.selected = true;
                })
            };

            // TODO recursive, bitch!
            function applyPerk(perk) {
                _.each(perk.effects, function (stats, id) {
                    var effect = effectsMap[id];
                    _.each(stats, function (value, id) {
                        if (_.isObject(value)) {
                            _.each(value, function (subValue, subId) {
                                effect.apply(subId, subValue, perk.selected);
                            });
                        }
                        else
                            effect.apply(id, value, perk.selected);
                    })
                })
            }

            var effectsMap = {
                add: {
                    apply: function (id, value, revert) {
                        CurrentState.stats.set(id,
                                CurrentState.stats.get(id) + (revert ? -1 * value : value)
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
                    apply: function (statWrapper, value, revert) {
                        if (revert)
                            CurrentState.stats.remove(statWrapper.id());
                        else
                            CurrentState.stats.set(statWrapper.id(), value);
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
        }]
);