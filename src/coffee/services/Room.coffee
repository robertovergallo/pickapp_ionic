angular.module('pickapp').service('Room', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/rooms'

  this.searchTravels = (room_id, params)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/search',
      method: 'POST',
      data: params
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.searchRooms = (search_term)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/search_rooms',
      method: 'GET',
      params: {q: search_term}
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getRooms = ->
    deferred = $q.defer()
    $http({
      url: urlBase,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getRoom = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getLatestRoom = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/latest_room',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.createRoom = (room)->
    deferred = $q.defer()
    $http({
      url: urlBase,
      method: 'POST',
      data: room
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.makeRoomFavourite = (room_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/set_favourite',
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.unmakeRoomFavourite = (room_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/unset_favourite',
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.updateRoom = (id, room)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + id,
      method: 'PUT',
      data: room
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)
