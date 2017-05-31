app.controller('accountController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/myaccount',
            data: {
                token: $cookies.get('myTokenCode'),
                mail: $scope.account.mail,
                firstname: $scope.account.firstname,
                lastname: $scope.account.lastname,
                image: $scope.account.image,
                lang: $scope.account.lang
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                if ($scope.account.pseudo != undefined)
                    $scope.success = "Profile updated";
                else
                    $scope.account = response.data.json;
            }
            else if (response.data.state == 'validation') {
                document.getElementById("hiddenaside").style.position="static";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
        });
    }

    function change_password() {
        $http({
            method: 'POST',
            url: 'http://46.101.7.5:4201/resetpass',
            data: {
                token: $cookies.get('myTokenCode'),
                password: $scope.oldPassword,
                password2: $scope.newPassword
            }
        }).then(function successCallback(response) {
            $scope.success = "";
            $scope.validation = "";
            $scope.error = "";

            if (response.data.state == 'success') {
                $scope.success = response.data.json;
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

    $scope.account = {};
    requete_api();

    document.getElementById("modify").onmouseover = function(){document.getElementById("modify_content").style.position="static";};
    document.getElementById("envoyer").onclick = requete_api;
    document.getElementById("change_password").onclick = change_password;
}]);
