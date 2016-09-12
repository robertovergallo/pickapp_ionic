angular.module('pickapp').controller 'ProfileTravelController', ($scope, $rootScope, $stateParams, User) ->

  getData = ->
    User.getTravelForUser($rootScope.user.id, $stateParams.travel_id).then( (resp) ->
      $scope.travel = resp.data
      console.log resp.data
    )

  getData()

  $scope.pullUpdate = ->
    getData()
    $scope.$broadcast('scroll.refreshComplete');

  $scope.markTravelAsCompleted = ->
    User.markTravelAsCompleted($rootScope.user.id, $stateParams.travel_id).then( (resp) ->
      $scope.travel = resp.data
    )