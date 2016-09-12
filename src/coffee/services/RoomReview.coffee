angular.module('pickapp').service('RoomReview', ($q, $http, $rootScope)->
  urlBase = '/api/rooms'

  this.createReviewForRoom = (review, room_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + '/' + room_id + '/room_reviews',
      method: 'POST',
      data: review
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this
)