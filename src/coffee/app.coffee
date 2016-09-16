angular.module 'pickapp', [
  'ionic',
  'ionic.cloud'
  'ng-token-auth'
  'ngCordova'
  'uiGmapgoogle-maps'
  'ngMessages'
  'ionic.contrib.ui.hscrollcards'
]

if window.location.protocol == 'http:'
  # DEV
  angular.module('pickapp').constant 'api_base', '/api_base'
  angular.module('pickapp').constant 'auth_base', '/auth_base'
else
  # PROD
  angular.module('pickapp').constant 'api_base', 'http://www.pick-app.it/api'
  angular.module('pickapp').constant 'auth_base', 'http://www.pick-app.it'
  # angular.module('pickapp').constant 'api_base', 'http://localhost:3000/api'
  # angular.module('pickapp').constant 'auth_base', 'http://localhost:3000'

auth = {}

angular.module('pickapp').run ($rootScope, $ionicPlatform, $ionicModal, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicLoading, $state, $timeout, $auth, $ionicHistory, $ionicPush, $ionicUser, $ionicAuth, $ionicPopup, $http, $filter, Notification, User, Profile ) ->
  
  $ionicPlatform.ready ->
    if window.cordova and window.cordova.plugins.Keyboard
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar false
    if window.cordova and window.StatusBar
      StatusBar.styleLightContent()
    if window.cordova and window.cordova.InAppBrowser
      window.open = window.cordova.InAppBrowser.open

    $rootScope.$on '$ionicView.afterEnter', (e) ->
      state = $ionicHistory.currentView().stateName
      console.log state
      if state == 'app.profile'
        $ionicNavBarDelegate.showBackButton(false)
      # angular.forEach history.views, (view, index) ->
      #   console.log 'views: ' + view.stateName
      # angular.forEach history.histories[$ionicHistory.currentHistoryId()].stack, (view, index) ->
      #   console.log 'history stack:' + view.stateName

    # Porco dio push

    # push = new Ionic.Push({
    #   'debug': true
    #   'onNotification': (notification) ->
    #     getNotifications()
    # })

    # min birth_date

    myDate = new Date();

    $rootScope.max_birth_date = new Date(
        myDate.getFullYear()-13,
        myDate.getMonth(),
        myDate.getDate());

    $rootScope.showProfileDialog = (user_id) ->
      Profile.showProfileDialog(user_id).then (resp)->
        $ionicModal.fromTemplateUrl('templates/profile_dialog.html',
          animation: 'slide-in-up'
          scope: $rootScope
        ).then (modal) ->
          $rootScope.profileModal = modal
          $rootScope.profileModal.profile = resp.data
          $rootScope.profileModal.show() 

    $rootScope.closeProfileModal = ->
      $rootScope.profileModal.hide()

    $rootScope.showTerms = () ->
      window.open('http://www.pick-app.it/#/terms')

    # Loading Status

    loading_timeout = {}

    $rootScope.$on 'loading:show', ->
      $ionicLoading.show()
      loading_timeout = $timeout( ()->
        $ionicLoading.hide()
      , 10000)

    $rootScope.$on 'loading:hide', ->
      $ionicLoading.hide()
      $timeout.cancel(loading_timeout)

    # PickApp Badges

    badges = [
      {title:'EcoKing', message:'150 viaggi da guidatore e passeggero e almeno 750km medi percorsi in ecologia'},
      {title:'SocialMaster', message:'100 viaggi sia da passeggero che guidatore con persone diverse'},
      {title:'Nerd', message:'50 viaggi verso scuole varie e posti di cultura'},
      {title:'Citizen', message:'5 viaggi da passeggero'},
    ]

    $rootScope.showBadgesDialog = (badge_id) ->
      $ionicPopup.alert
        title: badges[badge_id].title
        template: badges[badge_id].message
     
    # StateChanges

    $rootScope.$on '$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->
      # console.log "======================== START"
      # console.log $ionicHistory.currentStateName()
      # console.log $ionicHistory.viewHistory()
      # console.log $ionicHistory.enabledBack()
      # console.log $ionicHistory.currentView()
      # console.log "======================== END"

    # ngTokenAuth events for auth methods

    $rootScope.$on 'auth:login-success', ->
      console.log "auth:login-success"
      console.log $auth
      # $http.defaults.headers.common = $auth.retrieveData('auth_headers')
      console.log $auth.retrieveData('auth_headers')
      $ionicLoading.hide()
      $rootScope.closeAuthModal()
      # $rootScope.error = null
      $rootScope.loginForm = {}
      $rootScope.registrationForm = {}
      user_has_photo()
      getNotifications()
      getUserDetails()
      pushRegister()

    $rootScope.$on 'auth:login-error', ->
      console.log "auth:login-error"
      $ionicLoading.hide()
      alertPopup = $ionicPopup.alert({
        title: 'Credenziali Errate',
        template: 'Non è stato possibile effettuare il login, verifica le credenziali.'
      })


    $rootScope.$on 'auth:logout-success', ->
      console.log "auth:logout-success"
      $rootScope.showAuthModal()
      


    $rootScope.goto_search_rooms = (search_form) ->
      $state.go("app.rooms_search", {search_term: search_form.search_term})


    $rootScope.askForLogout = ->
      confirmPopup = $ionicPopup.confirm(
        title: 'Logout'
        template: 'Vuoi effettuare il logout?'
        cancelText: 'No'
        okText: 'Sì'
      )

      confirmPopup.then (res) ->
        if res
          pushUnregister()

    # User additional data

    pushUnregister = ->
      User.clearDeviceTokens($rootScope.user.id).then (resp) ->
        # push.unregister()
        $ionicAuth.logout();
        $auth.signOut()
        $ionicSideMenuDelegate.toggleLeft()
      , (error) ->
        $ionicAuth.logout();
        $auth.signOut()
        $ionicSideMenuDelegate.toggleLeft()


    pushRegister = ->
      console.log "PUSH REG"
      ionic_user = { email: 'pick_user_' + $rootScope.user.id + '@pickapp.it', password: md5($rootScope.user.id) }

      if !$ionicAuth.isAuthenticated()
        $ionicAuth.login('basic', ionic_user).then( ()->
          finallyRegisterPush()
          # Ionic.Auth.login('basic', { 'remember': true }, ionic_user).then( ()->
          #   finallyRegisterPush()
        , (err)->
          $ionicAuth.signup(ionic_user).then( () ->
            # `$ionicUser` is now registered
            $ionicAuth.login('basic', ionic_user).then ()->
              finallyRegisterPush()
          , (err) ->
            console.log err
          )

          # Ionic.Auth.signup(ionic_user).then(()->
          #   Ionic.Auth.login('basic', { 'remember': true }, ionic_user).then ()->
          #     finallyRegisterPush()
          # );
        );

    $rootScope.$on 'cloud:push:notification', (event, data) ->
      msg = data.message
      console.log "#{msg.title}: #{msg.text}"

    finallyRegisterPush =->
      console.log "FINALLY REG PUSH"
      $ionicPush.register().then((t) ->
        $ionicPush.saveToken t
      ).then (t) ->
        console.log 'Token saved:', t.token
        $ionicPush.saveToken(t)
        $ionicUser.save()
        User.updateDeviceTokens(t.token, $rootScope.user.id).then (resp) ->
          console.log resp

      # $ionicPush.register().then( (t) ->
      #   console.log "DIOMERDA"
      #   $ionicPush.saveToken(t)
      #   console.log('Token saved:', t.token)
      #   $ionicUser.save()
      #   User.updateDeviceTokens(t.token, $rootScope.user.id).then (resp) ->
      #     console.log resp
      # )

      # push.register (data) ->
      #   # Log out your device token (Save this!)
      #   console.log("Got Token:", data.token)
      #   push.saveToken(data.token)
      #   Ionic.User.current().save()
      #   User.updateDeviceTokens(data.token, $rootScope.user.id).then (resp) ->
      #     console.log resp

    user_has_photo = ->
      if (!$rootScope.user.profile_image_url)
        if $rootScope.user.image
          $rootScope.user.profile_image_url = $rootScope.user.image + "?width=400&height=400"
        else
          $rootScope.user.profile_image_url = "https://s3-eu-west-1.amazonaws.com/koodit/pickapp/shared/missing_user_photo.jpg"

    getNotifications = ->
      Notification.getNotifications($rootScope.user.id).then( (resp) ->
        $rootScope.notifications = $filter('filter')(resp.data, (element) ->
          element.is_message == false
        )

        $rootScope.notifications_count = $filter('filter')($rootScope.notifications, (element) ->
          element.clicked == false
        )

        $rootScope.notification_count = $rootScope.notifications_count.length


        $rootScope.messages = $filter('filter')(resp.data, (element) ->
          element.is_message == true
        )

        $rootScope.messages_count = $filter('filter')($rootScope.messages, (element) ->
          element.clicked == false
        )

        $rootScope.messages_count = $rootScope.messages_count.length

        $rootScope.total_notifications = $rootScope.notification_count + $rootScope.messages_count
      )

    getUserDetails = ->
      User.getPreferredRooms($rootScope.user.id).then( (resp) ->
        $rootScope.user.preferred_rooms = resp.data
      )
      User.getTravelsCount($rootScope.user.id).then( (resp) ->
        $rootScope.user.travels_count = resp.data
      )
      User.getReviewsCount($rootScope.user.id).then( (resp) ->
        $rootScope.user.reviews_count = resp.data
      )


    # User Login

    $ionicModal.fromTemplateUrl('templates/auth_modal.html',
      scope: $rootScope
      animation: 'slide-in-up'
      backdropClickToClose: false
      hardwareBackButtonClose: false
    ).then (modal) ->
      $rootScope.authModal = modal
      #$rootScope.showAuthModal()

      $rootScope.$on 'auth:validation-success', ->
        console.log "auth:validation-success"
        # $http.defaults.headers.common = $auth.retrieveData('auth_headers')
        console.log $auth.retrieveData('auth_headers')
        $rootScope.closeAuthModal()
        user_has_photo()
        getNotifications()
        getUserDetails()
        pushRegister()

      $rootScope.$on 'auth:validation-error', ->
        console.log "auth:validation-error"
        $rootScope.showAuthModal()
        pushUnregister()

      if !$rootScope.user.id
        if window.location.protocol == 'http:'
          $timeout( () ->
            loginForm = {email:'a.macchieraldo@koodit.it', password: 'password'}
            $auth.submitLogin(loginForm)
          , 3000)
        $rootScope.showAuthModal()

    $rootScope.showAuthModal = ->
      $rootScope.authModal.show()

    $rootScope.closeAuthModal = ->
      $rootScope.authModal.hide()

    # Alerts

    $rootScope.showAlert = (title, text) ->
      $ionicLoading.hide()
      $ionicPopup.alert
        title: title
        template: text

angular.module('pickapp').filter('nl2br', ['$filter', ($filter) ->
  return (data) ->
    if (data) 
      data.replace(/\n\r?/g, '<br />')
])
