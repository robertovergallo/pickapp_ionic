var auth;

angular.module('pickapp', ['ionic', 'ng-token-auth', 'ngCordova', 'uiGmapgoogle-maps']);

if (window.location.protocol === 'http:') {
  angular.module('pickapp').constant('api_base', '/api_base');
  angular.module('pickapp').constant('auth_base', '/auth_base');
} else {
  angular.module('pickapp').constant('api_base', 'http://www.pick-app.it/api');
  angular.module('pickapp').constant('auth_base', 'http://www.pick-app.it');
}

auth = {};

angular.module('pickapp').run(function($rootScope, $ionicPlatform, $ionicModal, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicLoading, $state, $timeout, $auth, $ionicHistory, $ionicPopup, $http, $filter, Notification, User) {
  return $ionicPlatform.ready(function() {
    var badges, getNotifications, getUserDetails, user_has_photo;
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if (window.cordova && window.StatusBar) {
      StatusBar.styleLightContent();
    }
    if (window.cordova && window.cordova.InAppBrowser) {
      window.open = window.cordova.InAppBrowser.open;
    }
    $rootScope.$on('loading:show', function() {
      return $ionicLoading.show();
    });
    $rootScope.$on('loading:hide', function() {
      return $ionicLoading.hide();
    });
    badges = [
      {
        title: 'EcoKing',
        message: '150 viaggi da guidatore e passeggero e almeno 750km medi percorsi in ecologia'
      }, {
        title: 'SocialMaster',
        message: '100 viaggi sia da passeggero che guidatore con persone diverse'
      }, {
        title: 'Nerd',
        message: '50 viaggi verso scuole varie e posti di cultura'
      }, {
        title: 'Citizen',
        message: '5 viaggi da passeggero'
      }
    ];
    $rootScope.showBadgesDialog = function(badge_id) {
      return $ionicPopup.alert({
        title: badges[badge_id].title,
        template: badges[badge_id].message
      });
    };
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if ($ionicSideMenuDelegate.isOpenLeft()) {
        return $ionicSideMenuDelegate.toggleLeft();
      }
    });
    $rootScope.$on('auth:login-success', function() {
      console.log("auth:login-success");
      $http.defaults.headers.common = $auth.retrieveData('auth_headers');
      $ionicLoading.hide();
      $rootScope.closeAuthModal();
      $rootScope.loginForm = {};
      $rootScope.registrationForm = {};
      user_has_photo();
      getNotifications();
      return getUserDetails();
    });
    $rootScope.$on('auth:login-error', function() {
      console.log("auth:login-error");
      return $ionicLoading.hide();
    });
    $rootScope.$on('auth:logout-success', function() {
      console.log("auth:logout-success");
      return $rootScope.showAuthModal();
    });
    $rootScope.askForLogout = function() {
      var confirmPopup;
      confirmPopup = $ionicPopup.confirm({
        title: 'Logout',
        template: 'Vuoi effettuare il logout?',
        cancelText: 'No',
        okText: 'Esci'
      });
      return confirmPopup.then(function(res) {
        if (res) {
          $auth.signOut();
          return $ionicSideMenuDelegate.toggleLeft();
        }
      });
    };
    user_has_photo = function() {
      if (!$rootScope.user.profile_image_url) {
        if ($rootScope.user.image) {
          return $rootScope.user.profile_image_url = $rootScope.user.image + "?width=400&height=400";
        } else {
          return $rootScope.user.profile_image_url = "https://s3-eu-west-1.amazonaws.com/koodit/pickapp/shared/missing_user_photo.jpg";
        }
      }
    };
    getNotifications = function() {
      return Notification.getNotifications($rootScope.user.id).then(function(resp) {
        $rootScope.notifications = $filter('filter')(resp.data, function(element) {
          return element.is_message === false;
        });
        $rootScope.notifications_count = $filter('filter')($rootScope.notifications, function(element) {
          return element.clicked === false;
        });
        $rootScope.notification_count = $rootScope.notifications_count.length;
        $rootScope.messages = $filter('filter')(resp.data, function(element) {
          return element.is_message === true;
        });
        $rootScope.messages_count = $filter('filter')($rootScope.messages, function(element) {
          return element.clicked === false;
        });
        $rootScope.messages_count = $rootScope.messages_count.length;
        return $rootScope.total_notifications = $rootScope.notification_count + $rootScope.messages_count;
      });
    };
    getUserDetails = function() {
      User.getPreferredRooms($rootScope.user.id).then(function(resp) {
        return $rootScope.user.preferred_rooms = resp.data;
      });
      User.getTravelsCount($rootScope.user.id).then(function(resp) {
        return $rootScope.user.travels_count = resp.data;
      });
      return User.getReviewsCount($rootScope.user.id).then(function(resp) {
        return $rootScope.user.reviews_count = resp.data;
      });
    };
    $ionicModal.fromTemplateUrl('templates/auth_modal.html', {
      scope: $rootScope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $rootScope.authModal = modal;
      $rootScope.$on('auth:validation-success', function() {
        console.log("auth:validation-success");
        $rootScope.closeAuthModal();
        user_has_photo();
        getNotifications();
        return getUserDetails();
      });
      $rootScope.$on('auth:validation-error', function() {
        console.log("auth:validation-error");
        return $rootScope.showAuthModal();
      });
      if (!$rootScope.user.id) {
        return $rootScope.showAuthModal();
      }
    });
    $rootScope.showAuthModal = function() {
      return $rootScope.authModal.show();
    };
    return $rootScope.closeAuthModal = function() {
      return $rootScope.authModal.hide();
    };
  });
});

angular.module('pickapp').filter('nl2br', [
  '$filter', function($filter) {
    return function(data) {
      if (data) {
        return data.replace(/\n\r?/g, '<br />');
      }
    };
  }
]);

angular.module('pickapp').config(function($stateProvider, $urlRouterProvider, $httpProvider, $authProvider, auth_base) {
  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        if (!(config.url.indexOf('public_messages') !== -1) && !(config.url.indexOf('travel_requests') !== -1) && !(config.url.indexOf('private_messages') !== -1)) {
          $rootScope.$broadcast('loading:show');
        }
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide');
        return response;
      }
    };
  });
  $authProvider.configure({
    storage: 'localStorage',
    apiUrl: auth_base,
    forceValidateToken: true,
    omniauthWindowType: 'inAppBrowser',
    authProviderPaths: {
      facebook: '/omniauth/facebook'
    }
  });
  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  });
  $stateProvider.state('app.home', {
    url: '/home',
    views: {
      'menu_content': {
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
      }
    }
  });
  $stateProvider.state('app.profile', {
    url: '/profile',
    views: {
      'menu_content': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.notifications', {
    url: '/notifications',
    views: {
      'menu_content': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.profile_driver', {
    url: '/profile_driver',
    views: {
      'menu_content': {
        templateUrl: 'templates/profile_driver.html',
        controller: 'ProfileDriverController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.profile_travels', {
    url: '/profile_travels/:travels',
    views: {
      'menu_content': {
        templateUrl: 'templates/profile_travels.html',
        controller: 'ProfileTravelsController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.profile_travel', {
    url: '/profile_travel/:travel_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/profile_travel.html',
        controller: 'ProfileTravelController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.cars', {
    url: '/cars',
    views: {
      'menu_content': {
        templateUrl: 'templates/cars.html',
        controller: 'CarsController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.rooms', {
    url: '/rooms',
    views: {
      'menu_content': {
        templateUrl: 'templates/rooms.html',
        controller: 'RoomsController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.rooms_category', {
    url: '/rooms/:room_category_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/rooms_category.html',
        controller: 'RoomsCategoryController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.room', {
    url: '/room/:room_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/room.html',
        controller: 'RoomController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.room_requests', {
    url: '/room_requests/:room_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/room_requests.html',
        controller: 'RoomRequestsController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.room_offers', {
    url: '/room_offers/:room_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/room_offers.html',
        controller: 'RoomOffersController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.room_request', {
    url: '/room_request/:travel_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/room_request.html',
        controller: 'RoomRequestController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.room_offer', {
    url: '/room_offer/:travel_id',
    views: {
      'menu_content': {
        templateUrl: 'templates/room_offer.html',
        controller: 'RoomOfferController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  return $urlRouterProvider.otherwise('/app/home');
});

angular.module('pickapp').controller('CarsController', function($scope, $rootScope, $ionicModal, $ionicLoading, Car) {
  var getData;
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    return Car.getUserCars($rootScope.user.id).then(function(resp) {
      return $scope.cars = resp.data;
    });
  };
  getData();
  $scope.handleDeleteClick = function(car_id) {
    return Car.deleteCarForUser(car_id, $rootScope.user.id).then(function(resp) {
      $scope.cars = resp.data.cars;
      return $rootScope.user.car_count = resp.data.user_car_count;
    });
  };
  $scope.newCar = {};
  $scope.handleCarNewClick = function() {
    $scope.newCar.user_id = $rootScope.user.id;
    $ionicLoading.show();
    return Car.createCarForUser($scope.newCar, $rootScope.user.id).then(function(resp) {
      $rootScope.user.car_count = resp.data;
      $ionicLoading.hide();
      $scope.closeNewCarModal();
      return Car.getUserCars($rootScope.user.id).then(function(resp) {
        return $scope.cars = resp.data;
      });
    });
  };
  $ionicModal.fromTemplateUrl('new-car-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.newCarModal = modal;
  });
  $scope.showNewCarModal = function() {
    return $scope.newCarModal.show();
  };
  return $scope.closeNewCarModal = function() {
    return $scope.newCarModal.hide();
  };
});

angular.module('pickapp').controller('HomeController', function($scope, $rootScope, $interval, $http, $auth, $filter, Notification, User) {
  var getNotifications, getUserDetails;
  $scope.pullUpdate = function() {
    getNotifications();
    getUserDetails();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getNotifications = function() {
    return Notification.getNotifications($rootScope.user.id).then(function(resp) {
      $rootScope.notifications = $filter('filter')(resp.data, function(element) {
        return element.is_message === false;
      });
      $rootScope.notifications_count = $filter('filter')($rootScope.notifications, function(element) {
        return element.clicked === false;
      });
      $rootScope.notification_count = $rootScope.notifications_count.length;
      $rootScope.messages = $filter('filter')(resp.data, function(element) {
        return element.is_message === true;
      });
      $rootScope.messages_count = $filter('filter')($rootScope.messages, function(element) {
        return element.clicked === false;
      });
      $rootScope.messages_count = $rootScope.messages_count.length;
      return $rootScope.total_notifications = $rootScope.notification_count + $rootScope.messages_count;
    });
  };
  return getUserDetails = function() {
    User.getPreferredRooms($rootScope.user.id).then(function(resp) {
      return $rootScope.user.preferred_rooms = resp.data;
    });
    User.getTravelsCount($rootScope.user.id).then(function(resp) {
      return $rootScope.user.travels_count = resp.data;
    });
    return User.getReviewsCount($rootScope.user.id).then(function(resp) {
      return $rootScope.user.reviews_count = resp.data;
    });
  };
});

angular.module('pickapp').controller('NotificationsController', function($scope, $state, $rootScope, $filter, Notification) {
  var getNotifications;
  $scope.active_section = 0;
  $scope.setActiveSection = function(id) {
    return $scope.active_section = id;
  };
  $scope.display_all_notifications = false;
  $scope.toggleAllNotifications = function() {
    return $scope.display_all_notifications = !$scope.display_all_notifications;
  };
  $scope.pullUpdate = function() {
    getNotifications();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getNotifications = function() {
    return Notification.getNotifications($rootScope.user.id).then(function(resp) {
      $rootScope.notifications = $filter('filter')(resp.data, function(element) {
        return element.is_message === false;
      });
      $rootScope.notifications_count = $filter('filter')($rootScope.notifications, function(element) {
        return element.clicked === false;
      });
      $rootScope.notification_count = $rootScope.notifications_count.length;
      $rootScope.messages = $filter('filter')(resp.data, function(element) {
        return element.is_message === true;
      });
      $rootScope.messages_count = $filter('filter')($rootScope.messages, function(element) {
        return element.clicked === false;
      });
      $rootScope.messages_count = $rootScope.messages_count.length;
      return $rootScope.total_notifications = $rootScope.notification_count + $rootScope.messages_count;
    });
  };
  getNotifications();
  $scope.setNotificationAsClicked = function(notification_id) {
    return Notification.setNotificationClicked($rootScope.user.id, notification_id).then(function(resp) {
      return getNotifications();
    });
  };
  return $scope.convertUrl = function(url) {
    var room_id, splitted_url, travel_id, travel_offer_id;
    if (url) {
      console.log(url);
      url = url.replace('#/', '');
      splitted_url = url.split('/');
      if (splitted_url[0] === "rooms") {
        room_id = parseInt(splitted_url[1]);
        if (splitted_url[2] === "travels") {
          travel_offer_id = parseInt(splitted_url[3]);
          $state.go('app.room_offer', {
            room_id: room_id,
            travel_id: travel_offer_id
          });
        }
        if (splitted_url[2] === "travel_requests") {
          travel_offer_id = parseInt(splitted_url[3]);
          $state.go('app.room_request', {
            room_id: room_id,
            travel_id: travel_offer_id
          });
        }
      }
      if (splitted_url[0] === "profile") {
        if (splitted_url[1] === "travels") {
          travel_id = parseInt(splitted_url[2]);
          return $state.go('app.profile_travel', {
            travel_id: travel_offer_id
          });
        }
      }
    }
  };
});

angular.module('pickapp').controller('ProfileController', function($scope, $rootScope, $interval, $ionicPlatform, $ionicLoading, $ionicActionSheet, $ionicPopover, User) {
  var getData, uploadProfileImage;
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  $scope.ProfileImage = {};
  $ionicPlatform.ready(function() {
    return $scope.selectPhoto = function() {
      var camera_options, hideSheet;
      camera_options = {
        quality: 50,
        destinationType: 0,
        sourceType: 1,
        allowEdit: true,
        encodingType: 0,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };
      return hideSheet = $ionicActionSheet.show({
        buttons: [
          {
            text: 'Rullino Foto'
          }, {
            text: 'Fotocamera'
          }
        ],
        titleText: 'Modifica foto profilo',
        cancelText: 'Annulla',
        cancel: function() {},
        buttonClicked: function(index) {
          var cameraError, cameraSuccess;
          camera_options.sourceType = index;
          cameraSuccess = function(imageData) {
            $scope.ProfileImage.profile_image_data = {
              base64: imageData,
              src: 'data:image/jpeg;base64,' + imageData
            };
            $scope.$apply();
            return uploadProfileImage();
          };
          cameraError = function(error) {};
          navigator.camera.getPicture(cameraSuccess, cameraError, camera_options);
          return true;
        }
      });
    };
  });
  uploadProfileImage = function() {
    $ionicLoading.show();
    return User.setUserImage($rootScope.user.id, $scope.ProfileImage).then(function(resp) {
      $rootScope.user.profile_image_url = resp.data;
      $scope.ProfileImage.profile_image_data = null;
      return $ionicLoading.hide();
    });
  };
  getData = function() {
    User.getTravelsAsDriver($rootScope.user.id).then(function(resp) {
      return $scope.driver_travels = resp.data;
    });
    User.getTravelsAsApplied($rootScope.user.id).then(function(resp) {
      return $scope.applied_travels = resp.data;
    });
    User.getTravelsAsApproved($rootScope.user.id).then(function(resp) {
      return $scope.approved_travels = resp.data;
    });
    User.getTravelsAsPassenger($rootScope.user.id).then(function(resp) {
      return $scope.passenger_travels = resp.data;
    });
    return User.getLatestReviewsAsTarget($rootScope.user.id).then(function(resp) {
      var i, len, ref, results, review;
      $scope.latest_reviews = resp.data;
      ref = $scope.latest_reviews;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        review = ref[i];
        results.push(review.stars_html = $rootScope.genRating(review.rating));
      }
      return results;
    });
  };
  return getData();
});

angular.module('pickapp').controller('ProfileDriverController', function($scope, $rootScope, $ionicPlatform, $ionicActionSheet, $ionicLoading, DriverDetail, User) {
  $scope.driverDetails = {};
  $ionicPlatform.ready(function() {
    return $scope.selectPhoto = function(select_photo_for) {
      var camera_options, hideSheet;
      camera_options = {
        quality: 75,
        destinationType: 0,
        sourceType: 1,
        allowEdit: true,
        encodingType: 0,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };
      return hideSheet = $ionicActionSheet.show({
        buttons: [
          {
            text: 'Rullino Foto'
          }, {
            text: 'Fotocamera'
          }
        ],
        titleText: 'Modifica foto profilo',
        cancelText: 'Annulla',
        cancel: function() {},
        buttonClicked: function(index) {
          var cameraError, cameraSuccess;
          camera_options.sourceType = index;
          cameraSuccess = function(imageData) {
            if (select_photo_for === 'patente') {
              $scope.driverDetails.patente_data = {
                base64: imageData,
                src: 'data:image/jpeg;base64,' + imageData
              };
            }
            if (select_photo_for === 'assicurazione') {
              $scope.driverDetails.assicurazione_data = {
                base64: imageData,
                src: 'data:image/jpeg;base64,' + imageData
              };
            }
            return $scope.$apply();
          };
          cameraError = function(error) {};
          navigator.camera.getPicture(cameraSuccess, cameraError, camera_options);
          return true;
        }
      });
    };
  });
  return $scope.handleBecameDriverForm = function() {
    $scope.driverDetails.user_id = $rootScope.user.id;
    $ionicLoading.show();
    return DriverDetail.createDriverDetail($scope.driverDetails).then(function(resp) {
      return User.fetchUserInfo($rootScope.user.id).then(function(resp) {
        $rootScope.user = resp.data;
        return $ionicLoading.hide();
      });
    });
  };
});

angular.module('pickapp').controller('ProfileTravelController', function($scope, $rootScope, $stateParams, User) {
  User.getTravelForUser($rootScope.user.id, $stateParams.travel_id).then(function(resp) {
    $scope.travel = resp.data;
    return console.log(resp.data);
  });
  return $scope.markTravelAsCompleted = function() {
    return User.markTravelAsCompleted($rootScope.user.id, $stateParams.travel_id).then(function(resp) {
      return $scope.travel = resp.data;
    });
  };
});

angular.module('pickapp').controller('ProfileTravelsController', function($scope, $rootScope, $stateParams, User) {
  if ($stateParams.travels === 'driver') {
    User.getTravelsAsDriver($rootScope.user.id).then(function(resp) {
      console.log(resp.data);
      return $scope.travels = resp.data;
    });
  }
  if ($stateParams.travels === 'passenger') {
    User.getTravelsAsPassenger($rootScope.user.id).then(function(resp) {
      console.log(resp.data);
      return $scope.travels = resp.data;
    });
  }
  if ($stateParams.travels === 'applied') {
    User.getTravelsAsApplied($rootScope.user.id).then(function(resp) {
      console.log(resp.data);
      return $scope.travels = resp.data;
    });
  }
  if ($stateParams.travels === 'approved') {
    return User.getTravelsAsApproved($rootScope.user.id).then(function(resp) {
      console.log(resp.data);
      return $scope.travels = resp.data;
    });
  }
});

angular.module('pickapp').controller('RoomController', function($scope, $rootScope, $stateParams, $ionicModal, Room, User, Car, TravelRequest, Travel) {
  $scope.repetitions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  Room.getRoom($stateParams.room_id).then(function(resp) {
    $scope.room = resp.data;
    $scope.map = {
      center: {
        latitude: resp.data.lat,
        longitude: resp.data.long
      },
      zoom: 16,
      events: {
        tilesloaded: function(map) {
          return $scope.$apply();
        }
      }
    };
    return $scope.marker = {
      id: 0,
      coords: {
        latitude: resp.data.lat,
        longitude: resp.data.long
      },
      options: {
        draggable: false
      }
    };
  });
  $scope.newTravelRequest = {};
  $scope.newTravelRequestDatePicker = function() {
    var date_picker_options, onError, onSuccess;
    date_picker_options = {
      date: $scope.newTravelRequest.one_way_datetime || new Date(),
      mode: 'datetime',
      locale: 'it_IT',
      cancelText: 'Annulla',
      okText: 'Conferma',
      cancelButtonLabel: 'Annulla',
      doneButtonLabel: 'Conferma',
      allowOldDates: 'false',
      minuteInterval: 5,
      is24Hour: true
    };
    onSuccess = function(date) {
      $scope.newTravelRequest.one_way_datetime = date;
      return $scope.$apply();
    };
    onError = function(error) {};
    return datePicker.show(date_picker_options, onSuccess, onError);
  };
  $scope.sendNewTravelRequest = function() {
    $scope.newTravelRequest.passenger_id = $rootScope.user.id;
    $scope.newTravelRequest.room_id = $scope.room.id;
    $scope.newTravelRequest.is_one_way = true;
    return TravelRequest.createTravelRequest($scope.room.id, $scope.newTravelRequest).then(function(resp) {
      console.log(resp.data);
      $scope.closeTravelRequestModal();
      return $scope.newTravelRequest = {};
    });
  };
  $ionicModal.fromTemplateUrl('travel-request-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.travelRequestModal = modal;
    return Car.getUserCarsSlim($rootScope.user.id).then(function(resp) {
      return $scope.cars = resp.data;
    });
  });
  $scope.showTravelRequestModal = function() {
    return $scope.travelRequestModal.show();
  };
  $scope.closeTravelRequestModal = function() {
    return $scope.travelRequestModal.hide();
  };
  $scope.newTravelOffer = {};
  $scope.newTravelOffer.travel_stops = [];
  $scope.newTravelOfferDatePicker = function() {
    var date_picker_options, onError, onSuccess;
    date_picker_options = {
      date: $scope.newTravelOffer.departure_datetime || new Date(),
      mode: 'datetime',
      locale: 'it_IT',
      cancelText: 'Annulla',
      okText: 'Conferma',
      cancelButtonLabel: 'Annulla',
      doneButtonLabel: 'Conferma',
      allowOldDates: 'false',
      minuteInterval: 5,
      is24Hour: true
    };
    onSuccess = function(date) {
      $scope.newTravelOffer.departure_datetime = date;
      return $scope.$apply();
    };
    onError = function(error) {};
    return datePicker.show(date_picker_options, onSuccess, onError);
  };
  $scope.newTravelOfferBackDatePicker = function() {
    var date_picker_options, onError, onSuccess;
    date_picker_options = {
      date: $scope.newTravelOffer.back_departure_datetime || new Date(),
      mode: 'datetime',
      locale: 'it_IT',
      cancelText: 'Annulla',
      okText: 'Conferma',
      cancelButtonLabel: 'Annulla',
      doneButtonLabel: 'Conferma',
      allowOldDates: 'false',
      minuteInterval: 5,
      is24Hour: true
    };
    onSuccess = function(date) {
      $scope.newTravelOffer.back_departure_datetime = date;
      return $scope.$apply();
    };
    onError = function(error) {};
    return datePicker.show(date_picker_options, onSuccess, onError);
  };
  $scope.addTravelStop = function() {
    if (!$scope.newTravelOffer.travel_stops) {
      $scope.newTravelOffer.travel_stops = [];
    }
    return $scope.newTravelOffer.travel_stops.push({});
  };
  $scope.removeTravelStop = function() {
    var lastItem;
    lastItem = $scope.newTravelOffer.travel_stops.length - 1;
    return $scope.newTravelOffer.travel_stops.splice(lastItem);
  };
  $scope.sendNewTravelOffer = function() {
    if ($scope.newTravelOffer.departure_datetime && $scope.newTravelOffer.user_address_addr && $scope.newTravelOffer.user_address_city && $scope.newTravelOffer.user_address_cap) {
      $scope.newTravelOffer.user_address = $scope.newTravelOffer.user_address_addr + " " + $scope.newTravelOffer.user_address_city + " " + $scope.newTravelOffer.user_address_cap;
      $scope.newTravelOffer.driver_id = $rootScope.user.id;
      $scope.newTravelOffer.room_id = $scope.room.id;
      return Travel.createTravel($scope.room.id, $scope.newTravelOffer).then(function(resp) {
        $scope.newTravelOffer = {};
        $scope.newTravelOffer.travel_stops = [];
        return $scope.closeTravelOfferModal();
      });
    }
  };
  $ionicModal.fromTemplateUrl('travel-offer-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.travelOfferModal = modal;
  });
  $scope.showTravelOfferModal = function() {
    return $scope.travelOfferModal.show();
  };
  $scope.closeTravelOfferModal = function() {
    return $scope.travelOfferModal.hide();
  };
  $ionicModal.fromTemplateUrl('map-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.mapModal = modal;
  });
  $scope.showMapModal = function() {
    return $scope.mapModal.show();
  };
  $scope.closeMapModal = function() {
    return $scope.mapModal.hide();
  };
  $ionicModal.fromTemplateUrl('description-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.descriptionModal = modal;
  });
  $scope.showDescriptionModal = function() {
    return $scope.descriptionModal.show();
  };
  $scope.closeDescriptionModal = function() {
    return $scope.descriptionModal.hide();
  };
  return $scope.toggleRoomFavourite = function() {
    if (!$scope.room.is_favourite) {
      return Room.makeRoomFavourite($stateParams.room_id).then(function(resp) {
        $scope.room.is_favourite = resp.data;
        return User.getPreferredRooms($rootScope.user.id).then(function(resp) {
          return $rootScope.user.preferred_rooms = resp.data;
        });
      });
    } else {
      return Room.unmakeRoomFavourite($stateParams.room_id).then(function(resp) {
        $scope.room.is_favourite = resp.data;
        return User.getPreferredRooms($rootScope.user.id).then(function(resp) {
          return $rootScope.user.preferred_rooms = resp.data;
        });
      });
    }
  };
});

angular.module('pickapp').controller('RoomOfferController', function($scope, $rootScope, $interval, $ionicPlatform, $ionicScrollDelegate, $stateParams, $ionicModal, Room, Travel, PublicMessage, PrivateChat, PrivateMessage) {
  var getChatData, getData, getPrivateChatData, keepKeyboardOpen, messages_interval;
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
      return cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
  });
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    return Travel.getTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      $scope.travel_offer = resp.data;
      console.log(resp.data);
      $scope.map = {
        center: {
          latitude: resp.data.starting_lat,
          longitude: resp.data.starting_lng
        },
        zoom: 16,
        events: {
          tilesloaded: function(map) {
            return $scope.$apply();
          }
        }
      };
      return $scope.marker = {
        id: 0,
        coords: {
          latitude: resp.data.starting_lat,
          longitude: resp.data.starting_lng
        },
        options: {
          draggable: false
        }
      };
    });
  };
  getChatData = function() {
    return PublicMessage.getPublicMessagesForTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      return $scope.travel_offer.public_messages = resp.data;
    });
  };
  getData();
  $scope.checkTravelDate = function() {
    if ($scope.travel_offer) {
      if (new Date($scope.travel_offer.departure_datetime) < new Date()) {
        return false;
      } else {
        return true;
      }
    }
  };
  $ionicModal.fromTemplateUrl('map-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.mapModal = modal;
  });
  $scope.showMapModal = function() {
    return $scope.mapModal.show();
  };
  $scope.closeMapModal = function() {
    return $scope.mapModal.hide();
  };
  $ionicModal.fromTemplateUrl('chat-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.chatModal = modal;
  });
  messages_interval = {};
  $scope.openChat = function() {
    getChatData();
    $scope.chatModal.show();
    return messages_interval = $interval(function() {
      getChatData();
      return $ionicScrollDelegate.$getByHandle('chat_pane').scrollBottom();
    }, 10000);
  };
  $scope.closeChatModal = function() {
    $interval.cancel(messages_interval);
    return $scope.chatModal.hide();
  };
  keepKeyboardOpen = function() {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
      console.log('textarea blur, focus back on it');
      txtInput[0].focus();
    });
  };
  $scope.newTravelOfferMessage = {};
  $scope.handleMessageNewClick = function(room_id, travel_offer_id) {
    $scope.newTravelOfferMessage.author_id = $rootScope.user.id;
    $scope.newTravelOfferMessage.travel_id = $scope.travel_offer.id;
    if ($scope.travel_offer.is_owner) {
      $scope.newTravelOfferMessage.is_request_owner = true;
    }
    return PublicMessage.createPublicMessage($scope.newTravelOfferMessage, $scope.travel_offer.room.id, travel_offer_id).then(function(resp) {
      $scope.newTravelOfferMessage.content = null;
      return $scope.travel_offer.public_messages = resp.data;
    });
  };
  $scope.applyForTravel = function() {
    return Travel.applyUser($stateParams.room_id, $stateParams.travel_id, $rootScope.user.id).then(function(resp) {
      return $scope.travel_offer = resp.data;
    });
  };
  $scope.cancelApplicationForTravel = function() {
    return Travel.cancelApplicationForTravel($stateParams.room_id, $stateParams.travel_id, $rootScope.user.id).then(function(resp) {
      return $scope.travel_offer.is_applied = resp.data;
    });
  };
  $scope.approveForTravel = function(user_id) {
    return Travel.approveUser($stateParams.room_id, $stateParams.travel_id, user_id).then(function(resp) {
      return $scope.travel_offer = resp.data;
    });
  };
  $scope.cancelApprovalForTravel = function(user_id) {
    return Travel.cancelApprovalForUser($stateParams.room_id, $stateParams.travel_id, user_id).then(function(resp) {
      return $scope.travel_offer = resp.data;
    });
  };
  $ionicModal.fromTemplateUrl('private-chat-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.privateChatModal = modal;
  });
  messages_interval = {};
  getPrivateChatData = function() {
    return PrivateMessage.getMessagesForPrivateChat($scope.travel_offer.room.id, $scope.travel_offer.id, $scope.private_chat_id).then(function(resp) {
      $scope.private_messages = resp.data;
      return console.log(resp.data);
    });
  };
  $scope.openPrivateChat = function() {
    getPrivateChatData();
    $scope.privateChatModal.show();
    return messages_interval = $interval(function() {
      getPrivateChatData();
      return $ionicScrollDelegate.$getByHandle('private_chat_pane').scrollBottom();
    }, 10000);
  };
  $scope.closePrivateChatModal = function() {
    $interval.cancel(messages_interval);
    $scope.private_chat_id = null;
    return $scope.privateChatModal.hide();
  };
  $scope.newTravelOfferPrivateMessage = {};
  $scope.handlePrivateMessageNewClick = function(room_id, travel_offer_id) {
    $scope.newTravelOfferPrivateMessage.author_id = $rootScope.user.id;
    $scope.newTravelOfferPrivateMessage.private_chat_id = $scope.private_chat_id;
    if ($scope.travel_offer.is_owner) {
      $scope.newTravelOfferPrivateMessage.is_request_owner = true;
    }
    return PrivateMessage.createMessage($scope.newTravelOfferPrivateMessage, $scope.travel_offer.room.id, $scope.travel_offer.id, $scope.private_chat_id).then(function(resp) {
      $scope.newTravelOfferPrivateMessage.content = null;
      return $scope.private_messages = resp.data;
    });
  };
  $scope.createPrivateChat = function() {
    return PrivateChat.createPrivateChat($scope.travel_offer.driver.id, $stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      $scope.private_chat_id = resp.data;
      $scope.openPrivateChat($scope.private_chat_id);
      return getData();
    });
  };
  return $scope.getPrivateChat = function(private_chat_id) {
    $scope.private_chat_id = private_chat_id;
    return $scope.openPrivateChat();
  };
});

angular.module('pickapp').controller('RoomOffersController', function($scope, $rootScope, $interval, $stateParams, $ionicModal, Room, Travel, PublicMessage) {
  var getData;
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    return Room.getRoom($stateParams.room_id).then(function(resp) {
      $scope.room = resp.data;
      return console.log(resp.data.travels);
    });
  };
  return getData();
});

angular.module('pickapp').controller('RoomRequestController', function($scope, $rootScope, $interval, $ionicHistory, $ionicScrollDelegate, $ionicPlatform, $stateParams, $ionicModal, $ionicPopup, Room, TravelRequest, TravelRequestMessage) {
  var getData, keepKeyboardOpen, messages_interval;
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
      return cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
  });
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    return TravelRequest.getTravelRequest($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      $scope.travel_request = resp.data;
      $scope.map = {
        center: {
          latitude: resp.data.lat,
          longitude: resp.data.lng
        },
        zoom: 16,
        events: {
          tilesloaded: function(map) {
            return $scope.$apply();
          }
        }
      };
      return $scope.marker = {
        id: 0,
        coords: {
          latitude: resp.data.lat,
          longitude: resp.data.lng
        },
        options: {
          draggable: false
        }
      };
    });
  };
  getData();
  $ionicModal.fromTemplateUrl('map-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.mapModal = modal;
  });
  $scope.showMapModal = function() {
    return $scope.mapModal.show();
  };
  $scope.closeMapModal = function() {
    return $scope.mapModal.hide();
  };
  $ionicModal.fromTemplateUrl('chat-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.chatModal = modal;
  });
  messages_interval = {};
  $scope.openChat = function() {
    $scope.chatModal.show();
    return messages_interval = $interval(function() {
      getData();
      return $ionicScrollDelegate.$getByHandle('chat_pane').scrollBottom();
    }, 10000);
  };
  $scope.closeChatModal = function() {
    $interval.cancel(messages_interval);
    return $scope.chatModal.hide();
  };
  keepKeyboardOpen = function() {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
      console.log('textarea blur, focus back on it');
      txtInput[0].focus();
    });
  };
  $scope.newTravelRequestMessage = {};
  $scope.handleMessageNewClick = function() {
    $scope.newTravelRequestMessage.author_id = $rootScope.user.id;
    $scope.newTravelRequestMessage.travel_request_id = $scope.travel_request.id;
    if ($scope.travel_request.is_owner) {
      $scope.newTravelRequestMessage.is_request_owner = true;
    }
    return TravelRequestMessage.createTravelRequestMessage($scope.newTravelRequestMessage, $scope.travel_request.room.id, $scope.travel_request.id).then(function(resp) {
      $scope.newTravelRequestMessage.content = null;
      return $scope.travel_request.public_messages = resp.data;
    });
  };
  return $scope.destroyTravelRequest = function() {
    var confirmPopup;
    confirmPopup = $ionicPopup.confirm({
      title: 'Elimina Richiesta',
      template: 'Sei sicuro di voler eliminare questa richiesta?'
    });
    return confirmPopup.then(function(res) {
      if (res) {
        return TravelRequest.destroyTravelRequest($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
          return $ionicHistory.goBack();
        });
      }
    });
  };
});

angular.module('pickapp').controller('RoomRequestsController', function($scope, $rootScope, $interval, $stateParams, $ionicModal, Room, TravelRequest, TravelRequestMessage) {
  var getData;
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    return Room.getRoom($stateParams.room_id).then(function(resp) {
      return $scope.room = resp.data;
    });
  };
  return getData();
});

angular.module('pickapp').controller('RoomsCategoryController', function($scope, $auth, $stateParams, RoomCategory) {
  return RoomCategory.getRoomCategory($stateParams.room_category_id).then(function(resp) {
    return $scope.room_category = resp.data;
  });
});

angular.module('pickapp').controller('RoomsController', function($scope, $interval, $http, $auth, RoomCategory) {
  return RoomCategory.getRoomCategories().then(function(resp) {
    return $scope.room_categories = resp.data;
  });
});

angular.module('pickapp').controller('WelcomeController', function($scope, $rootScope, $timeout, $ionicPopup, $auth, $ionicHistory, $ionicModal, $ionicActionSheet, $ionicPlatform, $cordovaCamera) {
  $scope.dati_italia = anagrafica;
  $ionicModal.fromTemplateUrl('intro-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.introModal = modal;
  });
  $scope.showIntroModal = function() {
    return $scope.introModal.show();
  };
  $scope.closeIntroModal = function() {
    return $scope.introModal.hide();
  };
  $ionicModal.fromTemplateUrl('login-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.loginModal = modal;
  });
  $scope.showLoginModal = function() {
    return $scope.loginModal.show();
  };
  $scope.closeLoginModal = function() {
    return $scope.loginModal.hide();
  };
  $rootScope.$on('auth:login-success', function() {
    return $scope.loginModal.hide();
  });
  $scope.$on('auth:password-reset-request-success', function(ev, data) {
    var alertPopup;
    return alertPopup = $ionicPopup.alert({
      title: 'Richiesta effettuata',
      template: 'Le informazioni per il recupero della password sono state inviate all\'indirizzo: ' + data.email
    });
  });
  $scope.askPasswordReset = function() {
    var myPopup;
    $scope.resetForm = {};
    return myPopup = $ionicPopup.show({
      template: '<input type="email" ng-model="resetForm.email" placeholder="Email">',
      title: 'Reset Password',
      subTitle: 'Inserisci la tua email',
      scope: $scope,
      buttons: [
        {
          text: 'Annulla'
        }, {
          text: '<b>Conferma</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.resetForm.email) {
              return e.preventDefault();
            } else {
              return $auth.requestPasswordReset($scope.resetForm);
            }
          }
        }
      ]
    });
  };
  $scope.registerForm = {};
  $ionicModal.fromTemplateUrl('register-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.registerModal = modal;
  });
  $scope.showRegisterModal = function() {
    return $scope.registerModal.show();
  };
  $scope.closeRegisterModal = function() {
    return $scope.registerModal.hide();
  };
  $rootScope.$on('auth:registration-email-success', function() {
    var alertPopup;
    $scope.registerModal.hide();
    return alertPopup = $ionicPopup.alert({
      title: 'Registrazione completata',
      template: 'È stata inviata una mail al tuo indirizzo per confermare il tuo account.'
    });
  });
  return $ionicPlatform.ready(function() {
    return $scope.selectPhoto = function() {
      var camera_options, hideSheet;
      camera_options = {
        quality: 50,
        destinationType: 0,
        sourceType: 1,
        allowEdit: true,
        encodingType: 0,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };
      return hideSheet = $ionicActionSheet.show({
        buttons: [
          {
            text: 'Rullino Foto'
          }, {
            text: 'Fotocamera'
          }
        ],
        cancelText: 'Annulla',
        cancel: function() {},
        buttonClicked: function(index) {
          var cameraError, cameraSuccess;
          camera_options.sourceType = index;
          cameraSuccess = function(imageData) {
            $scope.registerForm.profile_image_data = {
              base64: imageData,
              src: 'data:image/jpeg;base64,' + imageData
            };
            return $scope.$apply();
          };
          cameraError = function(error) {};
          navigator.camera.getPicture(cameraSuccess, cameraError, camera_options);
          return true;
        }
      });
    };
  });
});

angular.module('pickapp').service('Car', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/users';
  this.getUserCars = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getUserCarsSlim = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars/slim',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getCarForUser = function(car_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car_id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.createCarForUser = function(car, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars',
      method: 'POST',
      data: car
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.updateCarForUser = function(car, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car.id,
      method: 'PUT',
      data: car
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.deleteCarForUser = function(car_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/cars/' + car_id,
      method: 'DELETE'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('DriverDetail', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/users/';
  this.createDriverDetail = function(driverDetail) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + driverDetail.user_id + '/driver_details',
      method: 'POST',
      data: driverDetail
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('Notification', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/users';
  this.getNotificationCount = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/notifications/unclicked_count',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getNotifications = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/notifications',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getLatestNotifications = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/notifications/latest',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.setNotificationClicked = function(user_id, notification_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/notifications/' + notification_id + '/set_clicked',
      method: 'PUT'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('PrivateChat', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base;
  this.createPrivateChat = function(user_id, room_id, travel_id) {
    var data, deferred;
    deferred = $q.defer();
    data = {};
    data.user_id = user_id;
    $http({
      url: urlBase + '/rooms/' + room_id + '/travels/' + travel_id + '/private_chats',
      method: 'POST',
      data: data
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPrivateChatsForUser = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/private_chats',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('PrivateMessage', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.getMessagesForPrivateChat = function(room_id, travel_id, private_chat_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/private_chats/' + private_chat_id + '/private_messages',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.createMessage = function(message, room_id, travel_id, private_chat_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/private_chats/' + private_chat_id + '/private_messages',
      method: 'POST',
      data: message
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('PublicMessage', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.createPublicMessage = function(public_message, room_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/public_messages',
      method: 'POST',
      data: public_message
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPublicMessagesForTravel = function(room_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/public_messages',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('Room', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.searchTravels = function(room_id, params) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/search',
      method: 'POST',
      data: params
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getRooms = function() {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getRoom = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getLatestRoom = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/latest_room',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.createRoom = function(room) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase,
      method: 'POST',
      data: room
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.makeRoomFavourite = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/set_favourite',
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.unmakeRoomFavourite = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/unset_favourite',
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.updateRoom = function(id, room) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + id,
      method: 'PUT',
      data: room
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('RoomCategory', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/room_categories';
  this.getRoomCategories = function() {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getRoomCategory = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.createRoomCategory = function(room_category) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase,
      method: 'POST',
      data: room_category
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('RoomReview', function($q, $http, $rootScope) {
  var urlBase;
  urlBase = '/api/rooms';
  this.createReviewForRoom = function(review, room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/room_reviews',
      method: 'POST',
      data: review
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('Travel', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.createTravel = function(room_id, travel) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels',
      method: 'POST',
      data: travel
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravel = function(room_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.applyUser = function(room_id, travel_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/apply_user/' + user_id,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.destroyTravel = function(room_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id,
      method: 'DELETE'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.cancelApplicationForTravel = function(room_id, travel_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/cancel_application/' + user_id,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.approveUser = function(room_id, travel_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/approve_user/' + user_id,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.cancelApprovalForUser = function(room_id, travel_id, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/' + travel_id + '/cancel_approval/' + user_id,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsForRoom = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getNext24HoursTravelsForRoom = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travels/next_24_hours',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('TravelRequest', function($q, $http, $rootScope, $location, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.createTravelRequest = function(room_id, travel_request) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests',
      method: 'POST',
      data: travel_request
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelRequest = function(room_id, travel_request_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.destroyTravelRequest = function(room_id, travel_request_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id,
      method: 'DELETE'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelRequestsForRoom = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getNext24HoursTravelRequestsForRoom = function(room_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/next_24_hours',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('TravelRequestMessage', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/rooms';
  this.createTravelRequestMessage = function(travel_request_message, room_id, travel_request_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id + '/travel_request_messages',
      method: 'POST',
      data: travel_request_message
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getMessagesForTravelRequest = function(room_id, travel_request_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + room_id + '/travel_requests/' + travel_request_id + '/travel_request_messages',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('TravelReview', function($q, $http, $rootScope) {
  var urlBase;
  urlBase = '/api/users';
  this.getTravelReviewForUser = function(user_id, review_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/travel_reviews/' + review_id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.updateReviewForUser = function(user_id, review_id, review_data) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/travel_reviews/' + review_id,
      method: 'PUT',
      data: review_data
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.updateReviewForTravel = function(user_id, travel_id, review_id, review_data) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/' + user_id + '/travels/' + travel_id + '/travel_reviews/' + review_id,
      method: 'PUT',
      data: review_data
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').service('User', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/users/';
  this.signUserForSchool = function(user_id, school_code) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/sign_for_school/' + school_code,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelReviewsAsAuthor = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/travel_reviews/as_author',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelReviewsAsTarget = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/travel_reviews/as_target',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getLatestReviewsAsTarget = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/travel_reviews/as_target/latest',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.setUserImage = function(id, image) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/set_profile_image',
      method: 'POST',
      data: image
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.fetchUserInfo = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPreferredRooms = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/preferred_rooms',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsCount = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/travels_count',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getReviewsCount = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + '/reviews_count',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.pendingDriverVerificationCount = function() {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + 'pending_driver_verification_count',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsAsDriver = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels_as_driver',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsAsApplied = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels_as_applied',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsAsApproved = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels_as_approved',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelsAsPassenger = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels_as_passenger',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getTravelForUser = function(user_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels/' + travel_id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.markTravelAsCompleted = function(user_id, travel_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/travels/' + travel_id + '/mark_as_completed',
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPendingDrivers = function() {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + 'pending_drivers',
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPendingDriver = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + 'pending_drivers/' + id,
      method: 'GET'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.authPendingDriver = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + 'pending_drivers/auth/' + id,
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
});

angular.module('pickapp').factory('authInterceptor', function($injector) {
  var authInterceptor;
  authInterceptor = {
    request: function(config) {
      $injector.invoke(function($http, $auth) {
        return $http.defaults.headers.common = $auth.retrieveData('auth_headers');
      });
      return config;
    }
  };
  return authInterceptor;
});
