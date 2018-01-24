angular.module('pickapp').controller 'ProfileController', ($scope, $state, $rootScope, $interval, $ionicLoading, $ionicActionSheet, $ionicPlatform, $ionicModal, $ionicPopup, $auth, User) ->

  # Pull to Refresh

  $scope.pullUpdate = ->
    getData()
    $scope.$broadcast('scroll.refreshComplete');

  # Camera Handling

  $scope.ProfileImage = {}

  $ionicPlatform.ready ->
    $scope.selectPhoto = ->

      camera_options =
        quality: 50
        destinationType: 0
        sourceType: 1
        allowEdit: true
        encodingType: 0
        targetWidth: 800
        targetHeight: 800
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
            $scope.ProfileImage.profile_image_data = {
              base64: imageData
              src: 'data:image/jpeg;base64,' + imageData
            }
            $scope.$apply()
            uploadProfileImage()

          cameraError = (error) ->

          navigator.camera.getPicture(cameraSuccess, cameraError, camera_options)

          true
      )

  uploadProfileImage = ->
    $ionicLoading.show()
    User.setUserImage($rootScope.user.id, $scope.ProfileImage).then( (resp) ->
      #console.log resp.data
      $rootScope.user.profile_image_url = resp.data
      $scope.ProfileImage.profile_image_data = null
      $ionicLoading.hide()
    )

  # Profile Data

  getData = () ->
    User.getTravelsAsDriver($rootScope.user.id).then (resp) ->
      $scope.driver_travels = resp.data
    User.getTravelsAsApplied($rootScope.user.id).then (resp) ->
      $scope.applied_travels = resp.data
    User.getTravelsAsApproved($rootScope.user.id).then (resp) ->
      $scope.approved_travels = resp.data
    User.getTravelsAsPassenger($rootScope.user.id).then (resp) ->
      $scope.passenger_travels = resp.data

    User.getLatestReviewsAsTarget($rootScope.user.id).then (resp) ->
      $scope.latest_reviews = resp.data
      # for review in $scope.latest_reviews
      # 	review.stars_html = $rootScope.genRating(review.rating)

    console.log($rootScope.user);

  getData()

  # Edit Profile Modal

  $ionicModal.fromTemplateUrl('edit-profile-modal.html',
    scope: $scope
    animation: 'slide-in-up'
  ).then (modal) ->
    $scope.editProfileModal = modal

    $scope.newBirthDatePicker = () ->
      date_picker_options =
        date: $rootScope.user.birth_date || new Date()
        mode: 'date'
        locale: 'it_IT'
        cancelText: 'Annulla'
        okText: 'Conferma'
        cancelButtonLabel: 'Annulla'
        doneButtonLabel: 'Conferma'

      onSuccess = (date) ->
        $scope.editForm.birth_date = date
        $scope.$apply()

      onError = (error) ->
        # Android only
        # alert 'Error: ' + error

      datePicker.show date_picker_options, onSuccess, onError

    $scope.editForm = {
      birth_date: $rootScope.user.birth_date,
      prov: $rootScope.user.prov,
      comune: $rootScope.user.comune,
      address: $rootScope.user.address
      zip_code: $rootScope.user.zip_code
    }

    $scope.dati_italia = anagrafica

    $scope.updateProfile = ->
      $auth.updateAccount($scope.editForm)
        .then((resp) ->
          alertPopup = $ionicPopup.alert({
            title: 'Profilo aggiornato',
            template: 'Il tuo profilo è stato aggiornato con successo!'
          })
          $scope.editProfileModal.hide()
        )
        .catch((resp) ->
          alertPopup = $ionicPopup.alert({
            title: 'Errore',
            template: 'C\'è stato un problema durante l\'aggiornamento del profilo, contatta l\'assistenza.'
          })
          $scope.editProfileModal.hide()
        )

  $scope.showEditProfileModal = ->
    $scope.editProfileModal.show()

  $scope.closeEditProfileModal = ->
    $scope.editProfileModal.hide()


  # Delete Account

  $scope.deleteAccount = (ev) ->
    confirmPopup = $ionicPopup.confirm(
      title: 'Eliminazione Account'
      template: 'Vuoi eliminare l\'account?'
      cancelText: 'No'
      okText: 'Sì'
    )

    confirmPopup.then (res) ->
      if res
        $auth.destroyAccount()
          .then( (resp) ->
            $rootScope.user = {}
            $state.go('home')
          )
          .catch( (resp) ->

          );
