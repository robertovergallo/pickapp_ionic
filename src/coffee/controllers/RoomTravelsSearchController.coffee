angular.module('pickapp').controller 'RoomTravelsSearchController', (Room, $scope, $rootScope, $stateParams) ->

  $scope.toggle_list_type = true

  $scope.travelSearch = {}

  $scope.search_panel_open = true

  $scope.togglePanel = ->
    $scope.search_panel_open = !$scope.search_panel_open

  Room.getRoom($stateParams.room_id).then( (resp) ->
    $scope.room = resp.data
    $scope.travels = resp.data.travels;
  )

  $scope.newTravelOfferDatePicker = () ->
    date_picker_options = 
      date: $scope.travelSearch.min_departure_datetime || new Date()
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
      $scope.travelSearch.min_departure_datetime = date
      $scope.$apply()

    onError = (error) ->
      # Android only
      # alert 'Error: ' + error

    datePicker.show date_picker_options, onSuccess, onError

  $scope.newTravelOfferBackDatePicker = () ->
    date_picker_options = 
      date: $scope.travelSearch.max_departure_datetime || new Date()
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
      $scope.travelSearch.max_departure_datetime = date
      $scope.$apply()

    onError = (error) ->
      # Android only
      # alert 'Error: ' + error

    datePicker.show date_picker_options, onSuccess, onError

  $scope.searchTravels = ->
    Room.searchTravels($stateParams.room_id, $scope.travelSearch).then( (resp) ->
      $scope.found_travels = resp.data
      $scope.search_panel_open = false
    )

  $scope.searchTravels()