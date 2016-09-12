angular.module('pickapp').controller 'TravelController', ($scope, $rootScope, $interval, $timeout, $ionicPlatform, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicModal, User, Room, Travel, PublicMessage, PrivateChat, PrivateMessage, TravelReview) ->

	$ionicPlatform.ready ->
		if window.cordova and window.cordova.plugins.Keyboard
			cordova.plugins.Keyboard.disableScroll true
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar true
	
	# Data Parse

	getData = ->
		$ionicLoading.show()
		Travel.getTravel($stateParams.room_id, $stateParams.travel_id).then (resp) ->
			$scope.travel = resp.data
			console.log resp.data
			console.log $scope.travel, 'travel'

			$ionicLoading.hide()

			$scope.map = { 
				center: 
						latitude: resp.data.starting_lat
						longitude: resp.data.starting_lng 
				zoom: 16 
				events: {
					tilesloaded: (map) ->
						$scope.$apply()
				}
			}

			$scope.marker = {
				id: 0,
				coords: {
					latitude: resp.data.starting_lat
					longitude: resp.data.starting_lng
				}
				options: { draggable: false }
			}

			$scope.room_id = $stateParams.room_id
			$scope.travel_id = $stateParams.travel_id

	getDataForUser = ()->
		$ionicLoading.show()
		User.getTravelForUser($rootScope.user.id, $stateParams.travel_id).then (resp) ->
			$scope.travel = resp.data
			console.log resp.data
			$ionicLoading.hide()

			console.log $scope.travel, 'user'

			$scope.map = { 
				center: 
						latitude: resp.data.starting_lat
						longitude: resp.data.starting_lng 
				zoom: 16 
				events: {
					tilesloaded: (map) ->
						$scope.$apply()
				}
			}

			$scope.marker = {
				id: 0,
				coords: {
					latitude: resp.data.starting_lat
					longitude: resp.data.starting_lng
				}
				options: { draggable: false }
			}

			$scope.travel_id = $stateParams.travel_id
			$scope.room_id = $scope.travel.room.id

	parseTravel = () ->
		if $stateParams.room_id
			getData()
		else
			getDataForUser()

	$scope.pullUpdate = ->
		parseTravel()
		$scope.$broadcast('scroll.refreshComplete');
	
	parseTravel()
	
	# Chat Data Parse

	getChatData = () ->
		PublicMessage.getPublicMessagesForTravel($stateParams.room_id, $stateParams.travel_id).then (resp) ->
			$scope.travel.public_messages = resp.data
		

	# General Methods

	$scope.checkTravelDate = () ->
		if $scope.travel
			new Date($scope.travel.departure_datetime) > new Date()

	##### Travel Methods 

	## Passenger

	$scope.applyForTravel = ->
		Travel.applyUser($scope.room_id, $scope.travel_id, $rootScope.user.id).then (resp) ->
			$scope.travel = resp.data
			$rootScope.showAlert('Attenzione', 'Verifica sul sito del ministero la targa del guidatore per ulteriori informazioni. <a href="https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-copertura-rc">https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-copertura-rc</a>')

	$scope.cancelApplicationForTravel = ->
		Travel.cancelApplicationForTravel($scope.room_id, $scope.travel_id, $rootScope.user.id).then (resp) ->
			$scope.travel.is_applied = resp.data

	## Driver

	$scope.approveForTravel = (user_id) ->
		Travel.approveUser($scope.room_id, $scope.travel_id, user_id).then (resp) ->
			$scope.travel = resp.data

	$scope.cancelApprovalForTravel = (user_id) ->
		Travel.cancelApprovalForUser($scope.room_id, $scope.travel_id, user_id).then (resp) ->
			$scope.travel = resp.data

	$scope.markTravelAsCompleted = ->
		User.markTravelAsCompleted($rootScope.user.id, $scope.travel_id).then (resp) ->
			$scope.travel = resp.data

	$scope.destroyTravel = ->
		confirmPopup = $ionicPopup.confirm(
			title: 'Elimina Offerta'
			template: 'Sei sicuro di voler eliminare questa offerta?'
		)

		confirmPopup.then (res) ->
			if res
				Travel.destroyTravel($scope.room_id, $scope.travel_id).then (resp) ->
					$ionicHistory.goBack()
					$rootScope.showToast("Offerta cancellata con successo con successo")


	# Map Modal

	$ionicModal.fromTemplateUrl('map-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.mapModal = modal

	$scope.showMapModal = ->
		$scope.mapModal.show()

	$scope.closeMapModal = ->
		$scope.mapModal.hide()

	# # Chat Modal

	$ionicModal.fromTemplateUrl('chat-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.chatModal = modal

	messages_interval = {}

	$scope.openChat = ->
		getChatData()
		$scope.chatModal.show()
		messages_interval = $interval( () ->
			getChatData()
			$ionicScrollDelegate.$getByHandle('chat_pane').scrollBottom();
		, 10000)

	$timeout ->
		if $stateParams.open_public_chat == 'true'
			$scope.openChat()
	, 500

	$scope.closeChatModal = ->
		$interval.cancel(messages_interval)
		$scope.chatModal.hide()

	# this keeps the keyboard open on a device only after sending a message, it is non obtrusive

	keepKeyboardOpen = ->
		console.log 'keepKeyboardOpen'
		txtInput.one 'blur', ->
			console.log 'textarea blur, focus back on it'
			txtInput[0].focus()

	$scope.newTravelOfferMessage = {}

	$scope.handleMessageNewClick = (room_id, travel_offer_id)->
		$scope.newTravelOfferMessage.author_id = $rootScope.user.id
		$scope.newTravelOfferMessage.travel_id = $scope.travel.id
		if $scope.travel.is_owner
			$scope.newTravelOfferMessage.is_request_owner = true
		PublicMessage.createPublicMessage($scope.newTravelOfferMessage, $scope.travel.room.id, travel_offer_id).then( (resp) ->
			$scope.newTravelOfferMessage.content = null
			$scope.travel.public_messages = resp.data
		)

	# # Passenger Methods
				

	# Private Chats

	$ionicModal.fromTemplateUrl('private-chat-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.privateChatModal = modal

	messages_interval = {}

	getPrivateChatData = () ->
		PrivateMessage.getMessagesForPrivateChat($scope.travel.room.id, $scope.travel.id, $scope.private_chat_id).then( (resp) ->
			$scope.private_messages = resp.data
			console.log resp.data
		)

	$timeout ->
		if $stateParams.open_private_chat
			$scope.private_chat_id = $stateParams.open_private_chat
			$scope.openPrivateChat()
	, 500

	$scope.openPrivateChat = () ->
		getPrivateChatData()
		$scope.privateChatModal.show()
		messages_interval = $interval( () ->
			getPrivateChatData()
			$ionicScrollDelegate.$getByHandle('private_chat_pane').scrollBottom();
		, 10000)

	$scope.closePrivateChatModal = ->
		$interval.cancel(messages_interval)
		$scope.private_chat_id = null
		$scope.privateChatModal.hide()

	$scope.newTravelOfferPrivateMessage = {}

	$scope.handlePrivateMessageNewClick = (room_id, travel_id)->
		$scope.newTravelOfferPrivateMessage.author_id = $rootScope.user.id
		$scope.newTravelOfferPrivateMessage.private_chat_id = $scope.private_chat_id
		if $scope.travel.is_owner
			$scope.newTravelOfferPrivateMessage.is_request_owner = true
		PrivateMessage.createMessage($scope.newTravelOfferPrivateMessage, $scope.travel.room.id, $scope.travel.id, $scope.private_chat_id).then( (resp) ->
			$scope.newTravelOfferPrivateMessage.content = null
			$scope.private_messages = resp.data
		)

	$scope.createPrivateChat = ->
		PrivateChat.createPrivateChat($scope.travel.driver.id, $stateParams.room_id, $stateParams.travel_id).then( (resp) ->
			$scope.private_chat_id = resp.data
			$scope.openPrivateChat($scope.private_chat_id)
			getData()
		)

	$scope.getPrivateChat = (private_chat_id) ->
		$scope.private_chat_id = private_chat_id
		$scope.openPrivateChat()

	##### Reviews Methods

	$scope.reviewsToSubmit = []

	$scope.handleReviewNewClick = (travel_id, review_id, review_data) ->
		TravelReview.updateReviewForTravel($rootScope.user.id, travel_id, review_id, review_data).then (resp) ->
			$scope.travel.reviews_done.unshift(resp.data)
			$scope.travel.reviews_to_be_done = (x for x in $scope.travel.reviews_to_be_done when x.id != resp.data.id)
			$state.go($state.current, {travel_id: travel_id}, {reload: true})