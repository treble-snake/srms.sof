angular.module('srms.sof.calculator')
    .controller('PerksCtrl', [
        '$scope', '$rootScope', 'CurrentState', 'DataSource', 'TooltipMaker', 'statsToArrayFilter',
        function ($scope, $rootScope, CurrentState, DataSource, TooltipMaker, statsToArray) {

            var ctrl = this;

            /* Public section */
            this.getAllPerks = DataSource.getPerks;

            this.isPerkAvailable = function (perk) {
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
            };

            this.addPerk = function (id) {
                var perk = DataSource.getPerk(id);
                if (!perk || !ctrl.isPerkAvailable(perk))
                    return;

                applyPerk(perk);
                CurrentState.perks.toggle(id);
                perk.selected = !perk.selected;
            };

            this.getPerkTooltip = function (perkId, perk) {
                var statsArray = [];
                _.each(perk.effects, function (stats, effectId) {
                    statsArray = statsArray.concat(
                        prepareStatsForTooltip(statsToArray(stats), effectsMap[effectId]));
                });

                // TODO use templates
                return TooltipMaker.renderTooltip(perk, statsArray, composeTooltipEffectName,
                    function (parent) {
                        parent.append('<h2>Требования</h2>');
                        _.each(perk.for, function (value, id) {
                            parent.append('<div class="tooltip-stat">' +
                                restrictionsMap[id].getHint(value) + '</div>');
                        });
                    });
            };

            /* Private section */

            /**
             * Injects effect object to each stat item
             */
            function prepareStatsForTooltip(stats, effect) {
                _.each(stats, function (stat) {
                    stat['effect'] = effect;
                    if (_.isArray(stat.value))
                        prepareStatsForTooltip(stat.value, effect);
                });
                return stats;
            }

            function composeTooltipEffectName(stat) {
                if (!stat.effect)
                    return;

                var statText = DataSource.getStat(stat.id).name;
                if (!_.isArray(stat.value))
                    statText = stat.effect.getName(stat.value) + " " + statText;

                return statText;
            }


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
        }]
);