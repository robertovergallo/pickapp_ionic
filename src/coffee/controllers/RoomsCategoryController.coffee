angular.module('pickapp').controller 'RoomsCategoryController', ($scope, $auth, $stateParams, RoomCategory) ->

	RoomCategory.getRoomCategory($stateParams.room_category_id).then( (resp) ->
		$scope.room_category = resp.data
	)