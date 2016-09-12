angular.module('pickapp').controller 'RoomsController', ($scope, $interval, $http, $auth, RoomCategory) ->
	
	RoomCategory.getRoomCategories().then( (resp) ->
		$scope.room_categories = resp.data
	)