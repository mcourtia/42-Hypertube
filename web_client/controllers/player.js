app.controller('playerController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/getTorrent',
            data: {
                token: $cookies.get('myTokenCode'),
                imdbid: $scope.imdbid
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $scope.movie = response.data.json;
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

    var Url = document.location.href;
    $scope.imdbid = Url.substring(Url.lastIndexOf( "/" ) + 1);
    requete_api();
    $scope.comm = {};

    $scope.download = function(data) {
        $scope.success = "Please wait...";
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/dlTorrent',
            data: {
                token: $cookies.get('myTokenCode'),
                hash: data
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $scope.path = response.data.path;
                $scope.success = 'Your film is being downloaded, please wait (20 secs)...';
                setTimeout(function(){window.location.replace("http://46.101.7.5:4201/streaming/" + $scope.path)}, 20000);
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
    };

    $scope.sendComment = function() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/comment',
            data: {
                token: $cookies.get('myTokenCode'),
                comment: $scope.comm.com,
                imdbid: $scope.imdbid
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $scope.movie.comments.push({comment: $scope.comm.com, user: 'You', date: 'Just now'});
                $scope.comm.com = '';
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
    };
}]);