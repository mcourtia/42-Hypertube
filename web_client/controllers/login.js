app.controller('loginController', ['$scope', '$http','$cookies','$rootScope', function($scope, $http, $cookies, $rootScope) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/login' + $scope.Omethod,
            data: {
                pseudo: $scope.pseudo,
                password: $scope.password,
                Ocode: $scope.Ocode
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $cookies.put('myTokenCode', response.data.json);
                $scope.success = "Connexion réussie.";
                $rootScope.loggedin = true;
                setTimeout(function(){window.location.replace("http://46.101.7.5/#/my_account")}, 500);
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                document.getElementsByClassName("forgot")[0].style.display = "block";
                $scope.error = response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
        });
    }

    function reset_password() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/reset',
            data: {
                mail: $scope.mail,
                pseudo: $scope.pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}
            document.getElementsByClassName("forgot")[0].style.display = "block";

            if (response.data.state == 'success') {
                $scope.success = "Votre mot de passe a été réinitialisé et un mail vous a été envoyé";
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    $scope.Omethod = "";

    var Url = document.location.href;
    if (Url.split("/").length === 7) {
        $scope.Omethod = Url.split("/")[5];
        $scope.Ocode = Url.split("/")[6];
        requete_api();
    }

    var button = document.getElementById("envoyer");
    button.onclick = requete_api;

    var forgot = document.getElementById("forgot");
    forgot.onclick = reset_password;
}]);