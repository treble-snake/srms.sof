angular.module('srms.sof')
    .filter('statsToArray', ['DataSource', function (DataSource) {

        function toArray(input) {
            return _.map(input, function (value, key) {
                if (_.isObject(value)) {
                    value = toArray(value)
                }
                return {
                    id: key,
                    value: value,
                    order: DataSource.getStat(key).order
                }
            })
        }

        return function (input) {
            return toArray(input)
        }
    }])
    .filter('sortStats', ['DataSource', function (DataSource) {
        var DEFAULT_ORDER = 0;

        function getOrder(item) {
            return item.order || DEFAULT_ORDER;
        }

        function compareNames(a, b) {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            console.warn("equal stat names");
            return 0;
        }

        return function filter(input) {
// TODO check out calls qty: console.log("sort called");
            return input.sort(function (a, b) {
                var diff = getOrder(b) - getOrder(a);
                return  diff == 0 ? compareNames(a, b) : diff;
            });
        };
    }]);