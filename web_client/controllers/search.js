app.controller('searchController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/film',
            data: {
                token: $cookies.get('myTokenCode'),
                title: $scope.title,
                genre: $scope.kind,
                sort: $scope.sorting,
                page: $scope.page,
                yearMin: $scope.yearMin,
                yearMax: $scope.yearMax,
                noteMin: $scope.noteMin,
                noteMax: $scope.noteMax
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                jsonConcat($scope.films, response.data.json.results);

                var Url = document.location.href;
                Page = Url.substring(Url.lastIndexOf( "/" ) + 1);

                var a = document.body;
                if (a.scrollTop + window.innerHeight - a.scrollHeight == 0 && Page == 'search') {
                    $scope.page++;
                    requete_api();//ici la requete se lancera deux fois avec l'asynchrone,pas grave en soi
                }
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
        });
    }

    function jsonConcat(o1, o2) {
        for (var key in o2) {
            o1[$scope.page+"-"+key] = o2[key];
        }
    }

    $scope.films = {};
    $scope.title = '';
    $scope.kind = 'pop';
    $scope.sorting = 'pop';
    $scope.page = 1;
    $scope.yearMin = 1960;
    $scope.yearMax = 2017;
    $scope.yearSlider = {floor: 1900,ceil: 2017,step: 1};
    $scope.noteMin = 1;
    $scope.noteMax = 10;
    $scope.noteSlider = {floor: 0,ceil: 10,step: 1};
    requete_api();

    $scope.search = function() {
        $scope.sorting = 'title';
        $scope.films = {};
        $scope.page = 1;
        //$scope.kind = 'pop'; //on ne remet pas le genre pop : il est ignoré
        requete_api();
    };
    $scope.genre = function(genre) {
        $scope.kind = genre;
        $scope.sorting = 'pop';
        $scope.title = '';
        $scope.films = {};
        $scope.page = 1;
        requete_api();
    };
    $scope.$on("slideEnded", function() {
        $scope.sorting = 'pop';
        $scope.title = '';
        $scope.films = {};
        $scope.page = 1;
        requete_api();
    });
    $scope.sort = function (by) {
        $scope.sorting = by;
        $scope.films = {};
        $scope.page = 1;
        requete_api();
    };
    $scope.next_page = function() {
        $scope.page++;
        requete_api();
    };
    window.onscroll = function() {
        var a = document.body;
        if (a.scrollTop + window.innerHeight - a.scrollHeight == 0) {
            $scope.page++;
            requete_api();
        }
    };

    $scope.to_details = function(obj) {
        $scope.details = obj;
    };
    $scope.hide_details = function() {
        $scope.details = undefined;
    };

}]);