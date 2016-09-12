angular.module('pickapp').service('RoomCategory', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/room_categories'

  this.getRoomCategories = ->
    deferred = $q.defer()
    $http({
      url: urlBase,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getRoomCategory = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.createRoomCategory = (room_category)->
    deferred = $q.defer()
    $http({
      url: urlBase,
      method: 'POST',
      data: room_category
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  # this.makeRoomFavourite = (room_id)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room_id + '/set_favourite',
  #     method: 'POST',
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  # this.unmakeRoomFavourite = (room_id)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room_id + '/unset_favourite',
  #     method: 'POST',
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  # this.updateRoom = (room)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room.id,
  #     method: 'PUT',
  #     data: room
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  this
)