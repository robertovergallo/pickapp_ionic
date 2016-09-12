angular.module('pickapp').service('Travel', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/rooms'

  this.createTravel = (room_id, travel)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels' ,
      method: 'POST',
      data: travel
    })
    .then (data)->
      deferred.resolve(data)
      
    deferred.promise

  this.getTravel = (room_id, travel_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.applyUser = (room_id, travel_id, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/apply_user/' + user_id,
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.destroyTravel = (room_id, travel_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id ,
      method: 'DELETE',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.cancelApplicationForTravel = (room_id, travel_id, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/cancel_application/' + user_id,
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.approveUser = (room_id, travel_id, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/approve_user/' + user_id,
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.cancelApprovalForUser = (room_id, travel_id, user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/cancel_approval/' + user_id,
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getTravelsForRoom = (room_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getNext24HoursTravelsForRoom = (room_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/next_24_hours',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this
)
