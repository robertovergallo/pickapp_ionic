angular.module('pickapp').service('PublicMessage', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/rooms'

  this.createPublicMessage = (public_message, room_id, travel_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/public_messages' ,
      method: 'POST',
      data: public_message
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getPublicMessagesForTravel = (room_id, travel_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/public_messages' ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)