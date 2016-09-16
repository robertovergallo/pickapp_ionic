angular.module('pickapp').config ($stateProvider, $urlRouterProvider, $httpProvider, $authProvider, auth_base, $ionicCloudProvider) ->

  # Ionic Cloud

  $ionicCloudProvider.init({
    "core": {
      "app_id": "aaa54618"
    },
    "push": {
      "sender_id": "1084310756977",
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "#8DC549"
        }
      }
    }
  })
  
  $httpProvider.interceptors.push 'authInterceptor'

  $httpProvider.interceptors.push ($rootScope) ->
    {
      request: (config) ->
        # console.log config
        if !(config.url.indexOf('public_messages') != -1) && !(config.url.indexOf('travel_requests') != -1) && !(config.url.indexOf('private_messages') != -1) && !(config.url.indexOf('check_for_available_email') != -1)
          $rootScope.$broadcast 'loading:show'

        config
      response: (response) ->
        $rootScope.$broadcast 'loading:hide'
        response

    }

  # auth

  if window.location.protocol == 'http:'
    use_proxy = true
  else
    use_proxy = false

  $authProvider.configure
    storage: 'localStorage'
    apiUrl: auth_base
    forceValidateToken: true
    omniauthWindowType: 'inAppBrowser'
    authProviderPaths:
      facebook: '/auth/facebook'
    

  # routes

  $stateProvider.state 'app',
    url: '/app'
    abstract: true
    views: 'appContent':
      templateUrl: 'templates/menu.html'

  $stateProvider.state 'app.home',
    url: '/home'
    views: 'menu_content':
      templateUrl: 'templates/home.html'
      controller: 'HomeController'

  $stateProvider.state 'app.profile',
    url: '/profile'
    views: 'menu_content':
      templateUrl: 'templates/profile.html'
      controller: 'ProfileController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.user_travels',
    url: '/user_travels/:travels'
    views: 'menu_content':
      templateUrl: 'templates/profile_travels.html'
      controller: 'UserTravelsController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.notifications',
    url: '/notifications'
    views: 'menu_content':
      templateUrl: 'templates/notifications.html'
      controller: 'NotificationsController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.profile_driver',
    url: '/profile_driver'
    views: 'menu_content':
      templateUrl: 'templates/profile_driver.html'
      controller: 'ProfileDriverController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.profile_travel',
    url: '/profile_travel/:travel_id'
    views: 'menu_content':
      templateUrl: 'templates/travel.html'
      controller: 'TravelController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.cars',
    url: '/cars'
    views: 'menu_content':
      templateUrl: 'templates/cars.html'
      controller: 'CarsController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.rooms',
    url: '/rooms'
    views: 'menu_content':
      templateUrl: 'templates/rooms.html'
      controller: 'RoomsController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room_travels_search',
    url: '/room/:room_id/travels_search'
    views: 'menu_content':
      templateUrl: 'templates/room_travels_search.html'
      controller: 'RoomTravelsSearchController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.rooms_search',
    url: '/rooms/search/:search_term?'
    views: 'menu_content':
      templateUrl: 'templates/rooms_search.html'
      controller: 'RoomsSearchController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.rooms_category',
    url: '/rooms/:room_category_id'
    views: 'menu_content':
      templateUrl: 'templates/rooms_category.html'
      controller: 'RoomsCategoryController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room',
    url: '/room/:room_id'
    views: 'menu_content':
      templateUrl: 'templates/room.html'
      controller: 'RoomController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room_requests',
    url: '/room_requests/:room_id'
    cache: false
    views: 'menu_content':
      templateUrl: 'templates/room_requests.html'
      controller: 'RoomRequestsController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room_offers',
    url: '/room_offers/:room_id'
    cache: false
    views: 'menu_content':
      templateUrl: 'templates/room_offers.html'
      controller: 'RoomOffersController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room_request',
    url: '/room_request/:travel_id'
    views: 'menu_content':
      templateUrl: 'templates/room_request.html'
      controller: 'RoomRequestController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $stateProvider.state 'app.room_offer',
    url: '/rooms/:room_id/room_offer/:travel_id/public_chat/:open_public_chat?/private_chat/:open_private_chat?'
    views: 'menu_content':
      templateUrl: 'templates/travel.html'
      controller: 'TravelController'
      resolve:
        auth: ($auth) ->
          $auth.validateUser()

  $urlRouterProvider.otherwise '/app/home'

