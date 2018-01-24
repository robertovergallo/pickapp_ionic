angular.module('pickapp').controller 'RoomRequestsController', ($scope, $rootScope, $interval, $stateParams, $ionicModal, Room, TravelRequest, TravelRequestMessage) ->


  # Pull to Refresh

  $scope.pullUpdate = ->
    getData()
    $scope.$broadcast('scroll.refreshComplete');

  getData = () ->
    Room.getRoom($stateParams.room_id).then( (resp) ->
      $scope.room = resp.data
      console.log(resp.data)
    )

  getData()
