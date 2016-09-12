angular.module('pickapp').controller 'RoomOfferController', ($scope, $rootScope, $interval, $ionicPlatform, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicModal, Room, Travel, PublicMessage, PrivateChat, PrivateMessage) ->

	$ionicPlatform.ready ->
		if window.cordova and window.cordova.plugins.Keyboard
			cordova.plugins.Keyboard.disableScroll true
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar true
	

	$scope.pullUpdate = ->
		getData()
		$scope.$broadcast('scroll.refreshComplete');
	
	getData = ()->
		$ionicLoading.show()
		Travel.getTravel($stateParams.room_id, $stateParams.travel_id).then( (resp) ->
			$scope.travel_offer = resp.data

			$ionicLoading.hide()

			console.log resp.data

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
		)

	getChatData = () ->
		PublicMessage.getPublicMessagesForTravel($stateParams.room_id, $stateParams.travel_id).then( (resp) ->
			$scope.travel_offer.public_messages = resp.data
		)

	getData()

	# Travel Date Verification

	$scope.checkTravelDate = () ->
		if ($scope.travel_offer)
			if new Date($scope.travel_offer.departure_datetime) < new Date()
				false
			else
				true

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

	# Travel Stops Modal

	$ionicModal.fromTemplateUrl('travel-stops-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.travelStopsModal = modal

	$scope.showTravelStopsModal = ->
		$scope.travelStopsModal.show()

	$scope.closeTravelStopsModal = ->
		$scope.travelStopsModal.hide()

	# Chat Modal

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

	$scope.closeChatModal = ->
		$interval.cancel(messages_interval)
		$scope.chatModal.hide()

	# this keeps the keyboard open on a device only after sending a message, it is non obtrusive

	keepKeyboardOpen = ->
	  console.log 'keepKeyboardOpen'
	  txtInput.one 'blur', ->
	    console.log 'textarea blur, focus back on it'
	    txtInput[0].focus()
	    return
	  return

	$scope.newTravelOfferMessage = {}

	$scope.handleMessageNewClick = (room_id, travel_offer_id)->
		$scope.newTravelOfferMessage.author_id = $rootScope.user.id
		$scope.newTravelOfferMessage.travel_id = $scope.travel_offer.id
		if $scope.travel_offer.is_owner
			$scope.newTravelOfferMessage.is_request_owner = true
		PublicMessage.createPublicMessage($scope.newTravelOfferMessage, $scope.travel_offer.room.id, travel_offer_id).then( (resp) ->
			$scope.newTravelOfferMessage.content = null
			$scope.travel_offer.public_messages = resp.data
		)

	# Passenger Methods

	$scope.applyForTravel = ->
		Travel.applyUser($stateParams.room_id, $stateParams.travel_id, $rootScope.user.id).then( (resp) ->
			$scope.travel_offer = resp.data
		)

	$scope.cancelApplicationForTravel = ->
		Travel.cancelApplicationForTravel($stateParams.room_id, $stateParams.travel_id, $rootScope.user.id).then( (resp) ->
			$scope.travel_offer.is_applied = resp.data
		)

	# Travel Owner Methods

	$scope.approveForTravel = (user_id) ->
		Travel.approveUser($stateParams.room_id, $stateParams.travel_id, user_id).then( (resp) ->
			$scope.travel_offer = resp.data
		)

	$scope.cancelApprovalForTravel = (user_id) ->
		Travel.cancelApprovalForUser($stateParams.room_id, $stateParams.travel_id, user_id).then( (resp) ->
			$scope.travel_offer = resp.data
		)

	# Private Chats

	$ionicModal.fromTemplateUrl('private-chat-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.privateChatModal = modal

	messages_interval = {}

	getPrivateChatData = () ->
		PrivateMessage.getMessagesForPrivateChat($scope.travel_offer.room.id, $scope.travel_offer.id, $scope.private_chat_id).then( (resp) ->
			$scope.private_messages = resp.data
			console.log resp.data
		)

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

	$scope.handlePrivateMessageNewClick = (room_id, travel_offer_id)->
		$scope.newTravelOfferPrivateMessage.author_id = $rootScope.user.id
		$scope.newTravelOfferPrivateMessage.private_chat_id = $scope.private_chat_id
		if $scope.travel_offer.is_owner
			$scope.newTravelOfferPrivateMessage.is_request_owner = true
		PrivateMessage.createMessage($scope.newTravelOfferPrivateMessage, $scope.travel_offer.room.id, $scope.travel_offer.id, $scope.private_chat_id).then( (resp) ->
			$scope.newTravelOfferPrivateMessage.content = null
			$scope.private_messages = resp.data
		)

	$scope.createPrivateChat = ->
		PrivateChat.createPrivateChat($scope.travel_offer.driver.id, $stateParams.room_id, $stateParams.travel_id).then( (resp) ->
			$scope.private_chat_id = resp.data
			$scope.openPrivateChat($scope.private_chat_id)
			getData()
		)

	$scope.getPrivateChat = (private_chat_id) ->
		$scope.private_chat_id = private_chat_id
		$scope.openPrivateChat()

	$scope.destroyTravel = ->
		confirmPopup = $ionicPopup.confirm(
			title: 'Elimina Richiesta'
			template: 'Sei sicuro di voler eliminare questa offerta?')
		
		confirmPopup.then (res) ->
			if res
				Travel.destroyTravel($stateParams.room_id, $stateParams.travel_id).then( (resp) ->
					$ionicHistory.goBack()
				)