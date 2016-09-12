angular.module('pickapp').controller 'ProfileTravelsController', ($scope, $rootScope, $stateParams, User) ->

	$scope.display_completed_travels = false

	$scope.shouldDisplayTravel = (travel_dep_datetime) ->
		new Date(travel_dep_datetime) >= new Date()

	$scope.toggleCompletedTravels = ->
		$scope.display_completed_travels = !$scope.display_completed_travels

	if $stateParams.travels == 'driver'
		User.getTravelsAsDriver($rootScope.user.id).then (resp) ->
			console.log resp.data
			$scope.travels = resp.data

	if $stateParams.travels == 'passenger'
		User.getTravelsAsPassenger($rootScope.user.id).then (resp) ->
			console.log resp.data
			$scope.travels = resp.data

	if $stateParams.travels == 'applied'
		User.getTravelsAsApplied($rootScope.user.id).then (resp) ->
			console.log resp.data
			$scope.travels = resp.data

	if $stateParams.travels == 'approved'
		User.getTravelsAsApproved($rootScope.user.id).then (resp) ->
			console.log resp.data
			$scope.travels = resp.data