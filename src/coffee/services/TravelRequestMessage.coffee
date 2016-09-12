angular.module('pickapp').service('TravelRequestMessage', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/rooms'

  this.createTravelRequestMessage = (travel_request_message, room_id, travel_request_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id + '/travel_request_messages' ,
      method: 'POST',
      data: travel_request_message
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getMessagesForTravelRequest = (room_id, travel_request_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id + '/travel_request_messages' ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)