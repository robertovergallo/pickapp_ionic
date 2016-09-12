angular.module('pickapp').controller 'RoomRequestController', ($scope, $rootScope, $interval, $ionicHistory, $ionicScrollDelegate, $ionicPlatform, $stateParams, $ionicModal, $ionicPopup, Room, TravelRequest, TravelRequestMessage) ->

	$ionicPlatform.ready ->
		if window.cordova and window.cordova.plugins.Keyboard
			cordova.plugins.Keyboard.disableScroll true
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar true
	

	$scope.pullUpdate = ->
		getData()
		$scope.$broadcast('scroll.refreshComplete');
	
	getData = ()->
		TravelRequest.getTravelRequest($stateParams.room_id, $stateParams.travel_id).then( (resp) ->
			$scope.travel_request = resp.data

			$scope.map = { 
				center: 
						latitude: resp.data.lat
						longitude: resp.data.lng 
				zoom: 16 
				events: {
					tilesloaded: (map) ->
						$scope.$apply()
				}
			}

			$scope.marker = {
				id: 0,
				coords: {
					latitude: resp.data.lat
					longitude: resp.data.lng
				}
				options: { draggable: false }
			}
		)

	getData()

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

	# Chat Modal

	$ionicModal.fromTemplateUrl('chat-modal.html',
		scope: $scope
		animation: 'slide-in-up'
	).then (modal) ->
		$scope.chatModal = modal

	messages_interval = {}

	$scope.openChat = ->
		$scope.chatModal.show()
		messages_interval = $interval( () ->
			getData()
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

	$scope.newTravelRequestMessage = {}

	$scope.handleMessageNewClick = ()->
		$scope.newTravelRequestMessage.author_id = $rootScope.user.id
		$scope.newTravelRequestMessage.travel_request_id = $scope.travel_request.id
		if $scope.travel_request.is_owner
			$scope.newTravelRequestMessage.is_request_owner = true
		TravelRequestMessage.createTravelRequestMessage($scope.newTravelRequestMessage, $scope.travel_request.room.id, $scope.travel_request.id).then( (resp) ->
			$scope.newTravelRequestMessage.content = null
			$scope.travel_request.public_messages = resp.data
		)

	# Passenger Methods

	

	# Travel Owner Methods

	$scope.destroyTravelRequest = ->
		confirmPopup = $ionicPopup.confirm(
			title: 'Elimina Richiesta'
			template: 'Sei sicuro di voler eliminare questa richiesta?')
		confirmPopup.then (res) ->
			if res
				TravelRequest.destroyTravelRequest($stateParams.room_id, $stateParams.travel_id).then( (resp) ->
					$ionicHistory.goBack()
				)
			