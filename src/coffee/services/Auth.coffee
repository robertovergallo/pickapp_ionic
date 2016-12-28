angular.module('pickapp').service('Auth', ($rootScope, $log, $ionicModal, $ionicAuth, $ionicPopup, $ionicPush, $ionicUser, $auth, api_base, $q, $http, $filter, $ionicLoading, User, Notification)->

  fakeLogin = ->
    setTimeout( () ->
      loginForm = {email:'a.macchieraldo@koodit.it', password: 'password'}
      $auth.submitLogin(loginForm)
    , 1500)

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

    $rootScope.$on 'cloud:push:notification', (event, data) ->
      msg = data.message
      $log.debug "#{msg.title}: #{msg.text}"

  pushRegister = ->
    console.log "PUSH REG"
    ionic_user = { email: 'pick_user_' + $rootScope.user.id + '@pickapp.it', password: md5($rootScope.user.id) }

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
        $log.debug err
      )
    )

  pushUnregister = ->
    User.clearDeviceTokens($rootScope.user.id).then (resp) ->
      $ionicAuth.logout();
      $auth.signOut()
    , (error) ->
      $ionicAuth.logout();
      $auth.signOut()

  registerPushNotifications = ->
    $log.debug("User.registerPushNotifications")
    $ionicPush.register({ignore_user: true}).then( (t) ->
      $log.debug("$ionicPush.register", t)
      # $ionicPush.saveToken(t)
      $log.debug("$ionicPush.saveToken", t)
      User.updateDeviceTokens(t.token, $rootScope.user.football_user_id).then (resp) ->
        $log.debug resp
    ).then( (t) ->

    )

    $rootScope.$on 'cloud:push:notification', (event, data) ->
      $log.debug(data.message)

    # push.register()

  parseUserData = ->
    $rootScope.auth_modal.hide()
    registerPushNotifications()

    User.getActiveTeams().then (resp)->
      $log.debug("User.getActiveTeams", resp.data)
      $rootScope.user.teams = resp.data

    User.getFeed(10).then (resp)->
      $log.debug("User.getFeed", resp.data)
      $rootScope.user.feed = resp.data

  @init = ->
    $ionicModal.fromTemplateUrl('templates/auth_modal.html',
      scope: $rootScope
      backdropClickToClose: false
      hardwareBackButtonClose: false
      animation: 'slide-in-up'
    ).then (modal) ->
      $rootScope.auth_modal = modal

      # Login Events

      $rootScope.$on 'auth:login-success', (resp) ->
        # $log.debug('auth:login-success', $rootScope.user)
        $ionicLoading.hide()
        $rootScope.auth_modal.hide()
        # $rootScope.error = null
        $rootScope.loginForm = {}
        $rootScope.registrationForm = {}
        user_has_photo()
        getNotifications()
        getUserDetails()
        pushRegister()

      $rootScope.$on 'auth:login-error', (error) ->
        $log.debug('auth:login-error', error)
        $ionicLoading.hide()
        alertPopup = $ionicPopup.alert({
          title: 'Credenziali Errate',
          template: 'Non è stato possibile effettuare il login, verifica le credenziali.'
        })

      # Login Events

      $rootScope.$on 'auth:logout-success', ->
        $log.debug 'auth:logout-success'
        $rootScope.auth_modal.show()

      # Validation Events

      $rootScope.$on 'auth:validation-success', ->
        $log.debug('auth:validation-success', $rootScope.user)
        console.log "auth:validation-success"
        $rootScope.auth_modal.hide()
        user_has_photo()
        getNotifications()
        getUserDetails()
        pushRegister()

      $rootScope.$on 'auth:validation-error', ->
        console.log "auth:validation-error"
        $rootScope.auth_modal.show()
        pushUnregister()

      # Session Events

      $rootScope.$on 'auth:session-expired', ->
        # $log.debug 'auth:session-expired'
        # $rootScope.auth_modal.show()

      $rootScope.$on 'auth:registration-email-success', ->
        # $log.debug 'auth:registration-email-success'
        # $rootScope.register_modal.hide()

      # Default Behaviour

      $auth.validateUser()
      .then (resp) ->
        $log.debug('auth:validation-success', $rootScope.user)
        console.log "auth:validation-success"
        $rootScope.auth_modal.hide()
        user_has_photo()
        getNotifications()
        getUserDetails()
        pushRegister()
      .catch (err) ->
        $rootScope.auth_modal.show()
        fakeLogin() if window.location.protocol == 'http:'


      # if !$rootScope.user.id
      #   $log.debug 'User is not logged.'
      #   $rootScope.auth_modal.show()
      # else
      #   $log.debug 'User is logged.'

      # $rootScope.$on 'user:football_user_created', ->
      #   $log.debug 'New Football User Created'
      #   parseUserData()


    @askForLogout = ->
      confirmPopup = $ionicPopup.confirm(
        title: 'Logout'
        template: 'Vuoi effettuare il logout?'
        cancelText: 'No'
        okText: 'Sì'
      )

      confirmPopup.then (res) ->
        if res
          pushUnregister()



  this
)
