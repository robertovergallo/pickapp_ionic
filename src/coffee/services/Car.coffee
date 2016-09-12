angular.module('pickapp').service('Car', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/users'

  this.getUserCars = (user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getUserCarsSlim = (user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars/slim',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getCarForUser = (car_id, user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car_id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.createCarForUser = (car, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars',
      method: 'POST',
      data: car
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.updateCarForUser = (car, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car.id,
      method: 'PUT',
      data: car
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.deleteCarForUser = (car_id, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car_id,
      method: 'DELETE',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)