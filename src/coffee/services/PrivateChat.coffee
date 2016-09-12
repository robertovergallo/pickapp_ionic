angular.module('pickapp').service('PrivateChat', ($q, $http, $rootScope, api_base)->
  urlBase = api_base

  this.createPrivateChat = (user_id, room_id, travel_id)->
    deferred = $q.defer()
    data = {}
    data.user_id = user_id
    $http({
      url: urlBase + '/rooms/' + room_id + '/travels/' + travel_id + '/private_chats' ,
      method: 'POST',
      data: data
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.getPrivateChatsForUser = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/private_chats' ,
      method: 'GET',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)