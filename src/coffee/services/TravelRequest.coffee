angular.module('pickapp').service('TravelRequest', ($q, $http, $rootScope, $location, api_base)->
  urlBase = api_base + '/rooms'

  this.createTravelRequest = (room_id, travel_request)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests' ,
      method: 'POST',
      data: travel_request
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getTravelRequest = (room_id, travel_request_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.destroyTravelRequest = (room_id, travel_request_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id ,
      method: 'DELETE',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  # this.applyUser = (room_id, travel_id, user_id)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room_id + '/travels/' + travel_id + '/apply_user/' + user_id,
  #     method: 'POST',
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  # this.approveUser = (room_id, travel_id, user_id)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room_id + '/travels/' + travel_id + '/approve_user/' + user_id,
  #     method: 'POST',
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  # this.cancelApprovalForUser = (room_id, travel_id, user_id)->
  #   deferred = $q.defer()
  #   $http({
  #     url: urlBase + '/' + room_id + '/travels/' + travel_id + '/cancel_approval/' + user_id,
  #     method: 'POST',
  #   })
  #   .then (data)->
  #     deferred.resolve(data)

  #   deferred.promise

  this.getTravelRequestsForRoom = (room_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getNext24HoursTravelRequestsForRoom = (room_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/next_24_hours',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this
)
