angular.module('pickapp').controller('RoomsSearchController', (Room, $scope, $rootScope, $stateParams) ->

  $scope.search_term = ''

  $scope.search_rooms = (search_term) ->
    Room.searchRooms(search_term).then (resp) ->
      $scope.search_results = resp.data
      console.log resp.data


  if $stateParams.search_term
    $scope.search_term = $stateParams.search_term
    $scope.search_rooms($scope.search_term)
)
