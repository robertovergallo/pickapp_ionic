angular.module('pickapp').service('PrivateMessage', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/rooms'

  this.getMessagesForPrivateChat = (room_id, travel_id, private_chat_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/private_chats/' + private_chat_id + '/private_messages' ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.createMessage = (message, room_id, travel_id, private_chat_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/private_chats/' + private_chat_id + '/private_messages' ,
      method: 'POST',
      data: message
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)