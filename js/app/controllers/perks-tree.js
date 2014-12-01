angular.module('srms.sof')
    .controller('PerksCtrl', [
        '$scope', '$rootScope', 'CurrentState', 'DataSource', 'TooltipMaker', 'PerksHelper', 'statsToArrayFilter',
        function ($scope, $rootScope, CurrentState, DataSource, TooltipMaker, PerksHelper, statsToArray) {

            var ctrl = this;

            /* Public section */
            // TODO find better solution
            var order1 = 0;
            var order2 = 0;
            this.topLevelIds = _.map(
                _.sortBy(
                    _.filter(DataSource.getPerks(), function (item) {
                        return !item.parent;
                    }),
                    function (item) {
                        if (item.children && DataSource.getPerk(item.children[0]).children)
                            return 9999;

                        if (item.children) {
                            order2 += 11;
                            return order2;
                        }

                        order1 += 13;
                        return order1;
                    }),
                function (item) {
                    return item._id;
                });

            this.isSelected = CurrentState.perks.isSelected;
            this.getPerk = DataSource.getPerk;

            this.isAvailable = PerksHelper.isPerkAvailable;

            this.choose = function (id) {
                var perk = DataSource.getPerk(id);
                if (!perk || !ctrl.isAvailable(id, perk))
                    return;

                CurrentState.perks.toggle(id);
                PerksHelper.applyPerk(perk, ctrl.isSelected(id));
            };

            this.getTooltip = function (id) {
                var perk = DataSource.getPerk(id);
                var statsArray = [];
                _.each(perk.effects, function (stats, effectId) {
                    statsArray = statsArray.concat(
                        prepareStatsForTooltip(statsToArray(stats), PerksHelper.getEffect(effectId)));
                });

                // TODO use templates
                return TooltipMaker.renderTooltip(perk, statsArray, composeTooltipEffectName,
                    function (parent) {
                        parent.append('<h2>Требования</h2>');
                        _.each(perk.for, function (value, id) {
                            parent.append('<div class="tooltip-stat">' +
                                PerksHelper.getHint(id, value)
                                + '</div>');
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
        }]
);