angular.module('srms.sof.current-state', [])

    // Some json utils
    .factory('CurrentState', function () {

        var currentClass;
        var currentStats;

        return {
            getClass: function() {
                return currentClass;
            },

            getClassId: function() {
                return currentClass.id;
            },

            setClass: function(id, clazz) {
                currentClass = clazz;
                currentClass.id = id;
            }
        }
    });