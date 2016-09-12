angular.module('pickapp').controller 'WelcomeController', ($scope, $rootScope, $timeout, $ionicPopup, $auth, $ionicHistory, $ionicModal, $ionicActionSheet, $ionicPlatform, $cordovaCamera) ->

	$scope.dati_italia = anagrafica

	# Info Modal

	$ionicModal.fromTemplateUrl('info-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.infoModal = modal

	$scope.showInfoModal = ->
		$scope.infoModal.show()

	$scope.closeInfoModal = ->
		$scope.infoModal.hide()

  # Intro Modal

	$ionicModal.fromTemplateUrl('intro-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.introModal = modal

	$scope.showIntroModal = ->
		$scope.introModal.show()



	$scope.closeIntroModal = ->
		$scope.introModal.hide()

	# Login & Password Reset

	$ionicModal.fromTemplateUrl('login-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.loginModal = modal

	$scope.showLoginModal = ->
		$scope.loginModal.show()

	$scope.closeLoginModal = ->
		$scope.loginModal.hide()

	$rootScope.$on 'auth:login-success', ->
		$scope.loginModal.hide()

	$scope.$on 'auth:password-reset-request-success', (ev, data) ->
		alertPopup = $ionicPopup.alert({
			title: 'Richiesta effettuata',
			template: 'Le informazioni per il recupero della password sono state inviate all\'indirizzo: ' + data.email
		})

	$scope.askPasswordReset = ->
		$scope.resetForm = {}
		# An elaborate, custom popup
		myPopup = $ionicPopup.show(
			template: '<input type="email" ng-model="resetForm.email" placeholder="Email">'
			title: 'Reset Password'
			subTitle: 'Inserisci la tua email'
			scope: $scope
			buttons: [
				{ text: 'Annulla' }
				{
					text: '<b>Conferma</b>'
					type: 'button-positive'
					onTap: (e) ->
						if !$scope.resetForm.email
							e.preventDefault()
						else
							$auth.requestPasswordReset($scope.resetForm)
				}
			])

	# Login & Password Reset

	$scope.registerForm = {}

	$ionicModal.fromTemplateUrl('register-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.registerModal = modal

	$scope.showRegisterModal = ->
		$scope.registerModal.show()

	$scope.closeRegisterModal = ->
		$scope.registerModal.hide()

	$rootScope.$on 'auth:registration-email-success', ->
		$scope.registerModal.hide()
		alertPopup = $ionicPopup.alert({
			title: 'Registrazione completata',
			template: 'È stata inviata una mail al tuo indirizzo per confermare il tuo account.'
		})

	$rootScope.$on 'auth:registration-email-error', ->
		if ($scope.registerModal.password != $scope.registerModal.password_confirmation)
			$rootScope.showAlert 'Errore', 'Le password non coincidono'
		else
			$rootScope.showAlert 'Errore', 'Devi compilare tutti i campi per completare la registrazione!'


	# Camera Handling

	$ionicPlatform.ready ->
		$scope.selectPhoto = ->

			camera_options = 
				quality: 50
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
				#titleText: 'Seleziona sorgente'
				cancelText: 'Annulla'
				cancel: ->

				buttonClicked: (index) ->
					camera_options.sourceType = index

					cameraSuccess = (imageData) ->
						$scope.registerForm.profile_image_data = {
							base64: imageData
							src: 'data:image/jpeg;base64,' + imageData
						}
						$scope.$apply()

					cameraError = (error) ->

					navigator.camera.getPicture(cameraSuccess, cameraError, camera_options)

					true
			)

			

