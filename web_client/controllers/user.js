app.controller('userController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/useraccount',
            data: {
                token: $cookies.get('myTokenCode'),
                Opseudo: Pseudo
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.account = response.data.json;
            }
            else if (response.data.state == 'validation') {
                document.getElementsByClassName("profile")[0].style.display = "block";
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
    var Pseudo = Url.substring(Url.lastIndexOf( "/" ) + 1);
    requete_api();
}]);