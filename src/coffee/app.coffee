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
  angular.module('pickapp').constant 'auth_base', '/api_base'
else
  # PROD
  angular.module('pickapp').constant 'api_base', 'http://www.pick-app.it/api'
  angular.module('pickapp').constant 'auth_base', 'http://www.pick-app.it/api'
  # angular.module('pickapp').constant 'api_base', 'http://localhost:3000/api'
  # angular.module('pickapp').constant 'auth_base', 'http://localhost:3000/api'

auth = {}

angular.module('pickapp').run ($rootScope, $ionicPlatform, $ionicModal, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicLoading, $state, $timeout, $ionicHistory, $ionicPopup, Notification, User, Profile, Auth ) ->

  $ionicPlatform.ready ->
    if window.cordova and window.cordova.plugins.Keyboard
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar false
    if window.cordova and window.StatusBar
      StatusBar.styleLightContent()
    if window.cordova and window.cordova.InAppBrowser
      window.open = window.cordova.InAppBrowser.open

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

    $rootScope.$on 'loading:show', ->
      $ionicLoading.show({duration: 5000})

    $rootScope.$on 'loading:hide', ->
      $ionicLoading.hide()

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

    $rootScope.goto_search_rooms = (search_form) ->
      $state.go("app.rooms_search", {search_term: search_form.search_term})


    $rootScope.askForLogout = ->
      Auth.askForLogout()

    $rootScope.showAlert = (title, text) ->
      $ionicLoading.hide()
      $ionicPopup.alert
        title: title
        template: text

    $rootScope.clearHistory = ->
      $ionicHistory.clearHistory()

    Auth.init()

angular.module('pickapp').filter('nl2br', ['$filter', ($filter) ->
  return (data) ->
    if (data)
      data.replace(/\n\r?/g, '<br />')
])
