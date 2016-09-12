angular.module('pickapp').controller 'RoomOffersController', ($scope, $rootScope, $interval, $stateParams, $ionicModal, Room, Travel, PublicMessage) ->
	

	$scope.pullUpdate = ->
		getData()
		$scope.$broadcast('scroll.refreshComplete');

	getData = () ->
		Room.getRoom($stateParams.room_id).then( (resp) ->
			$scope.room = resp.data
			console.log resp.data.travels
		)

	getData()
