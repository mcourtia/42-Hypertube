var app = angular.module('scotchApp', ['ngRoute','ngCookies','rzModule']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : 'templates/home.html',
        })
        .when('/create', {
            templateUrl : 'templates/create.html',
            controller  : 'createController'
        })
        .when('/login', {
            templateUrl : 'templates/login.html',
            controller  : 'loginController'
        })
        .when('/login/:method/:code', {
            templateUrl : 'templates/login.html',
            controller  : 'loginController'
        })
        .when('/my_account', {
            templateUrl : 'templates/account.html',
            controller  : 'accountController'
        })
        .when('/user/:id', {
            templateUrl : 'templates/user.html',
            controller  : 'userController'
        })
        .when('/search', {
            templateUrl : 'templates/search.html',
            controller  : 'searchController'
        })
        .when('/player/:id', {
            templateUrl : 'templates/player.html',
            controller  : 'playerController'
        })
        .otherwise({
            templateUrl : 'templates/404.html'
        });
});

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
app.directive('fileDropzone', function() {
    return {
        restrict: 'A',
        scope: {
            file: '=',
            fileName: '='
        },
        link: function(scope, element, attrs) {
            var checkSize,
                isTypeValid,
                processDragOverOrEnter,
                validMimeTypes;

            processDragOverOrEnter = function (event) {
                if (event != null) {
                    event.preventDefault();
                }
                event.dataTransfer.effectAllowed = 'copy';
                return false;
            };

            validMimeTypes = attrs.fileDropzone;

            checkSize = function(size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };

            isTypeValid = function(type) {
                if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                    return false;
                }
            };

            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);

            return element.bind('drop', function(event) {
                var file, name, reader, size, type;
                if (event != null) {
                    event.preventDefault();
                }
                reader = new FileReader();
                reader.onload = function(evt) {
                    if (checkSize(size) && isTypeValid(type)) {
                        return scope.$apply(function() {
                            scope.file = evt.target.result;
                            if (angular.isString(scope.fileName)) {
                                return scope.fileName = name;
                            }
                        });
                    }
                };
                file = event.dataTransfer.files[0];
                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsDataURL(file);
                return false;
            });
        }
    };
});

app.controller('mainController', ['$scope','$rootScope','$http','$cookies', function($scope, $rootScope, $http, $cookies) {

    $rootScope.loggedin = !!$cookies.get('myTokenCode');

    var deco = document.getElementById("deco");
    deco.onclick = function () {
        $cookies.remove('myTokenCode');
        $rootScope.loggedin = false;
        setTimeout(function(){window.location.replace("http://46.101.7.5/#/login")}, 100);
    };
}]);