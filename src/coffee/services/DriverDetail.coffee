angular.module('pickapp').service('DriverDetail', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/users/'

  this.createDriverDetail = (driverDetail)->
    deferred = $q.defer()
    $http({
      url: urlBase + driverDetail.user_id + '/driver_details',
      method: 'POST',
      data: driverDetail
    })
    .then (data) ->
      deferred.resolve(data)
    , (error) ->
      deferred.reject(error)

    deferred.promise

  this
)