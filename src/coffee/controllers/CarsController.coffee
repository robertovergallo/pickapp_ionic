angular.module('pickapp').controller 'CarsController', ($scope, $rootScope, $ionicModal, $ionicLoading, Car) ->

	$scope.pullUpdate = ->
		getData()
		$scope.$broadcast('scroll.refreshComplete');

	# Cars Methods

	getData = ->
		Car.getUserCars($rootScope.user.id).then( (resp) ->
			$scope.cars = resp.data;
		)

	getData()

	$scope.handleDeleteClick = (car_id) ->
		Car.deleteCarForUser(car_id, $rootScope.user.id).then( (resp) ->
			$scope.cars = resp.data.cars
			$rootScope.user.car_count = resp.data.user_car_count
		)

	# NewCar Methods

	$scope.newCar = {}

	$scope.handleCarNewClick = ->
		$scope.newCar.user_id = $rootScope.user.id
		$ionicLoading.show()
		Car.createCarForUser($scope.newCar, $rootScope.user.id).then( (resp) ->
			$rootScope.user.car_count = resp.data
			$ionicLoading.hide()
			$scope.closeNewCarModal()
			Car.getUserCars($rootScope.user.id).then( (resp) ->
				$scope.cars = resp.data;
			)
		)
	

	# NewCar Modal

	$ionicModal.fromTemplateUrl('new-car-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.newCarModal = modal

	$scope.showNewCarModal = ->
		$scope.newCarModal.show()

	$scope.closeNewCarModal = ->
		$scope.newCarModal.hide()