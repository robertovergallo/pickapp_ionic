angular.module('pickapp').service 'Profile', ($q, $http, $rootScope, $ionicModal, api_base)->
  
  urlBase = api_base + '/users/'

  this.showProfileDialog = (id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + id + "/profile",
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this
