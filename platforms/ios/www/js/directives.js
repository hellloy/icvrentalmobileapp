angular.module('app.directives', [])

.directive('enter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.enter);
                });

                event.preventDefault();
            }
        });
    };
})
.directive('syncFocusWith', function ($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function ($scope, $element, attrs) {
            $scope.$watch("focusValue", function (currentValue, previousValue) {

                if (currentValue === true && !previousValue) {
                    $element[0].focus();
                    console.log('focus');
                } else if (currentValue === false && previousValue) {
                    $element[0].blur();
                    console.log('blur');
                }
            })
        }
    }
})
.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});