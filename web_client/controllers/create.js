app.controller('createController', function($scope, $http) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/create',
            data: {
                mail: $scope.mail,
                pseudo: $scope.pseudo,
                password: $scope.password,
                password2: $scope.password2,
                firstname: $scope.firstname,
                lastname: $scope.lastname,
                image: $scope.image
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $scope.success = response.data.json;
                setTimeout(function(){window.location.replace("http://46.101.7.5/#/login")}, 1500);
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            } else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
        });
    }

    var button = document.getElementById("envoyer");
    button.onclick = requete_api;
});