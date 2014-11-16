angular.module('srms.sof.calculator')
    .factory('TooltipMaker', [function () {

        var maker = this;

        /** Current method to compose a stat name */
        this.composeNameMethod = undefined;

        /**
         * @param stats Array of objects with stat values
         * @param parent DOM element
         */
        this.renderStats = function (stats, parent) {
            _.each(stats, function (stat) {
                parent.append('<div class="tooltip-stat">' + maker.composeNameMethod(stat) + '</div>');

                if (_.isObject(stat.value)) {
                    maker.renderStats(stat.value,
                        parent.children('.tooltip-stat').last())
                }
            });
        };

        // TODO use template
        return {
            /**
             *
             * @param subject must have "name" and "desc" properties
             * @param data array of stats
             * @param composeName method to compose a stat name
             * @param appendCustomData method to append custom data
             * @returns {*}
             */
            renderTooltip: function (subject, data, composeName, appendCustomData) {
                var result = $('<section class="tree-tooltip"></section>');
                result.append('<h1>' + subject.name + ' ($' + subject.price + ')</h1>');
                result.append('<p class="desc">' + subject.desc + '</p>');
                result.append('<h2>Характеристики</h2>');

                maker.composeNameMethod = composeName;
                maker.renderStats(data, result);

                if(_.isFunction(appendCustomData))
                    appendCustomData(result);

                return result.wrap("<div/>").parent().html();
            }

        }
    }]);