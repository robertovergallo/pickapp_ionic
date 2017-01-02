angular.module('pickapp').controller 'ProfileDriverController', ($scope, $rootScope, $ionicPlatform, $ionicActionSheet, $ionicLoading, DriverDetail, $ionicScrollDelegate, User) ->


	$scope.dati_italia = anagrafica

	# Camera Handling

	$scope.driverDetails = {}

	# Pull Update

	$scope.pullUpdate = ->
		User.fetchUserInfo($rootScope.user.id).then (resp) ->
			$rootScope.user = resp.data
			$scope.$broadcast('scroll.refreshComplete');

	$ionicPlatform.ready ->
		$scope.selectPhoto = (select_photo_for) ->

			camera_options =
				quality: 75
				destinationType: 0
				sourceType: 1
				allowEdit: true
				encodingType: 0
				targetWidth: 500
				targetHeight: 500
				#popoverOptions: CameraPopoverOptions
				saveToPhotoAlbum: false
				correctOrientation: true

			hideSheet = $ionicActionSheet.show(
				buttons: [
					{ text: 'Rullino Foto' }
					{ text: 'Fotocamera' }
				]
				titleText: 'Modifica foto profilo'
				cancelText: 'Annulla'
				cancel: ->

				buttonClicked: (index) ->
					camera_options.sourceType = index

					cameraSuccess = (imageData) ->

						if select_photo_for == 'patente'
							$scope.driverDetails.patente_data = {
								base64: imageData
								src: 'data:image/jpeg;base64,' + imageData
							}

						if select_photo_for == 'assicurazione'
							$scope.driverDetails.assicurazione_data = {
								base64: imageData
								src: 'data:image/jpeg;base64,' + imageData
							}

						$scope.$apply()

					cameraError = (error) ->

					navigator.camera.getPicture(cameraSuccess, cameraError, camera_options)

					true
			)


	$scope.handleBecameDriverForm = ->
		if $scope.driverDetails.accept_terms
			$scope.driverDetails.user_id = $rootScope.user.id
			DriverDetail.createDriverDetail($scope.driverDetails).then( (resp) ->
				$rootScope.showAlert 'Grazie', 'Abbiamo ricevuto i tuoi dati, se è tutto ok a breve verrai confermato!'
				$ionicScrollDelegate.$getByHandle('profile_driver_scroller').scrollTop()
				User.fetchUserInfo($rootScope.user.id).then (resp) ->
					$rootScope.user = resp.data
			, (error) ->
				$rootScope.showAlert 'Errore', 'Compila tutti i dati necessari!'
			)
