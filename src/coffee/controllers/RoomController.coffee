angular.module('pickapp').controller 'RoomController', ($ionicPlatform, $scope, $rootScope, $stateParams, $ionicModal, $ionicHistory, Room, User, Car, TravelRequest, Travel) ->

  $ionicPlatform.ready ->
		if window.cordova and window.cordova.plugins.Keyboard
			cordova.plugins.Keyboard.disableScroll true
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar false

  Room.getRoom($stateParams.room_id).then( (resp) ->
    $scope.room = resp.data

    $scope.map = {
      center: {
        latitude: resp.data.lat
        longitude: resp.data.long
      },
      zoom: 16,
      events: {
        tilesloaded: (map) ->
          $scope.$apply()
      }
    }

    $scope.marker = {
      id: 0,
      coords: {
        latitude: resp.data.lat
        longitude: resp.data.long
      },
      options: { draggable: false }
    }
  )

  # Travel Request Modal

  $scope.newTravelRequest = {
    towards_room: true
  }

  $scope.newTravelRequestDatePicker = () ->
    date_picker_options =
      date: $scope.newTravelRequest.one_way_datetime || new Date()
      mode: 'datetime'
      locale: 'it_IT'
      cancelText: 'Annulla'
      okText: 'Conferma'
      cancelButtonLabel: 'Annulla'
      doneButtonLabel: 'Conferma'
      allowOldDates: 'false'
      minuteInterval: 5
      is24Hour: true

    onSuccess = (date) ->
      $scope.newTravelRequest.one_way_datetime = date
      $scope.$apply()

    onError = (error) ->
      # Android only
      # alert 'Error: ' + error

    datePicker.show date_picker_options, onSuccess, onError

  $scope.sendNewTravelRequest = () ->
    $scope.newTravelRequest.passenger_id = $rootScope.user.id
    $scope.newTravelRequest.room_id = $scope.room.id
    $scope.newTravelRequest.is_one_way = true

    if ($scope.newTravelRequest.starting_address_addr && $scope.newTravelRequest.starting_address_city && $scope.newTravelRequest.starting_address_cap)
      $scope.newTravelRequest.starting_address = $scope.newTravelRequest.starting_address_addr + " " + $scope.newTravelRequest.starting_address_city + " " + $scope.newTravelRequest.starting_address_cap
      $scope.newTravelRequest.desired_address = $scope.newTravelRequest.starting_address_addr
      $scope.newTravelRequest.city = $scope.newTravelRequest.starting_address_city
      $scope.newTravelRequest.zip_code = $scope.newTravelRequest.starting_address_cap

      TravelRequest.createTravelRequest($scope.room.id, $scope.newTravelRequest).then( (resp) ->
        console.log resp.data
        $scope.closeTravelRequestModal()
        $scope.newTravelRequest = {}
        $rootScope.showAlert('Congratulazioni', 'Richiesta di passaggio inserita correttamente.')
        # Room.getRoom($scope.room.id).then( (resp) ->
        # 	$scope.room = resp.data
        # 	$scope.newTravelRequest = {}
        # )
      )

  $ionicModal.fromTemplateUrl('travel-request-modal.html',
    scope: $scope
    animation: 'slide-in-up'
  ).then (modal) ->
    $scope.travelRequestModal = modal

    Car.getUserCarsSlim($rootScope.user.id).then( (resp) ->
      $scope.cars = resp.data
    )

  $scope.showTravelRequestModal = ->
    $scope.travelRequestModal.show()

  $scope.closeTravelRequestModal = ->
    $scope.travelRequestModal.hide()

  # Travel Offer Modal

  $scope.newTravelOffer = {
    towards_room: true
  }
  $scope.newTravelOffer.travel_stops = []

  $scope.newTravelOfferDatePicker = () ->
    date_picker_options =
      date: $scope.newTravelOffer.departure_datetime || new Date()
      mode: 'datetime'
      locale: 'it_IT'
      cancelText: 'Annulla'
      okText: 'Conferma'
      cancelButtonLabel: 'Annulla'
      doneButtonLabel: 'Conferma'
      allowOldDates: 'false'
      minuteInterval: 5
      is24Hour: true

    onSuccess = (date) ->
      $scope.newTravelOffer.departure_datetime = date
      $scope.$apply()

    onError = (error) ->
      # Android only
      # alert 'Error: ' + error

    datePicker.show date_picker_options, onSuccess, onError

  $scope.newTravelOfferBackDatePicker = () ->
    date_picker_options =
      date: $scope.newTravelOffer.departure_datetime || new Date()
      mode: 'datetime'
      locale: 'it_IT'
      cancelText: 'Annulla'
      okText: 'Conferma'
      cancelButtonLabel: 'Annulla'
      doneButtonLabel: 'Conferma'
      allowOldDates: 'false'
      minuteInterval: 5
      is24Hour: true

    onSuccess = (date) ->
      $scope.newTravelOffer.back_departure_datetime = date
      $scope.$apply()

    onError = (error) ->
      # Android only
      # alert 'Error: ' + error

    datePicker.show date_picker_options, onSuccess, onError

  $scope.addTravelStop = ->
    if (!$scope.newTravelOffer.travel_stops)
      $scope.newTravelOffer.travel_stops = []

    $scope.newTravelOffer.travel_stops.push({})

  $scope.removeTravelStop = ->
    lastItem = $scope.newTravelOffer.travel_stops.length-1
    $scope.newTravelOffer.travel_stops.splice(lastItem)

  $scope.sendNewTravelOffer = () ->

    if ($scope.newTravelOffer.departure_datetime && $scope.newTravelOffer.user_address_addr && $scope.newTravelOffer.user_address_city && $scope.newTravelOffer.user_address_cap && $scope.newTravelOffer.car_id)
      $scope.newTravelOffer.user_address = $scope.newTravelOffer.user_address_addr + " " + $scope.newTravelOffer.user_address_city + " " + $scope.newTravelOffer.user_address_cap
      $scope.newTravelOffer.driver_id = $rootScope.user.id
      $scope.newTravelOffer.room_id = $scope.room.id
      $scope.newTravelOffer.repetions_amount = $scope.newTravelOffer.repetitions_amount
      Travel.createTravel($scope.room.id, $scope.newTravelOffer).then( (resp) ->
        $scope.newTravelOffer = {}
        $scope.newTravelOffer.travel_stops = []
        $scope.closeTravelOfferModal()
        $rootScope.showAlert('Congratulazioni', 'Offerta di passaggio inserita correttamente.')
      )
    else
      $rootScope.showAlert('Errore', 'Compila tutto il form per continuare.')

  $ionicModal.fromTemplateUrl('travel-offer-modal.html',
    scope: $scope
    animation: 'slide-in-up'
  ).then (modal) ->
    $scope.travelOfferModal = modal

  $scope.showTravelOfferModal = ->
    $scope.travelOfferModal.show()

  $scope.closeTravelOfferModal = ->
    $scope.travelOfferModal.hide()

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

  # Description Modal

  $ionicModal.fromTemplateUrl('description-modal.html',
    scope: $scope
    animation: 'slide-in-up'
  ).then (modal) ->
    $scope.descriptionModal = modal

  $scope.showDescriptionModal = ->
    $scope.descriptionModal.show()

  $scope.closeDescriptionModal = ->
    $scope.descriptionModal.hide()

  # Room Methods

  $scope.toggleRoomFavourite = ->
    if !$scope.room.is_favourite
      Room.makeRoomFavourite($stateParams.room_id).then( (resp) ->
        $scope.room.is_favourite = resp.data
        User.getPreferredRooms($rootScope.user.id).then( (resp) ->
          $rootScope.user.preferred_rooms = resp.data
        )
      )
    else
      Room.unmakeRoomFavourite($stateParams.room_id).then( (resp) ->
        $scope.room.is_favourite = resp.data
        User.getPreferredRooms($rootScope.user.id).then( (resp) ->
          $rootScope.user.preferred_rooms = resp.data
        )
      )

    Room.getRoom($stateParams.room_id).then (resp) ->
      $scope.room = resp.data
