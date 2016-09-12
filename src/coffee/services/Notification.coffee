angular.module('pickapp').service('Notification', ($q, $http, $rootScope, api_base)->
  urlBase = api_base + '/users'

  this.getNotificationCount = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/notifications/unclicked_count',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getNotifications = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/notifications',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getLatestNotifications = (user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/notifications/latest',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.setNotificationClicked = (user_id, notification_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + user_id + '/notifications/' + notification_id + '/set_clicked',
      method: 'PUT',
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)