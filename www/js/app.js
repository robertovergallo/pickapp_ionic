var auth;

angular.module('pickapp', ['ionic', 'ionic.cloud', 'ng-token-auth', 'ngCordova', 'uiGmapgoogle-maps', 'ngMessages', 'ionic.contrib.ui.hscrollcards']);

if (window.location.protocol === 'http:' && window.location.host !== "localhost:8080") {
  angular.module('pickapp').constant('api_base', '/api_base_me');
  angular.module('pickapp').constant('auth_base', '/api_base_me');
} else {
  angular.module('pickapp').constant('api_base', 'http://www.pick-app.it/api');
  angular.module('pickapp').constant('auth_base', 'http://www.pick-app.it/api');
}

auth = {};

angular.module('pickapp').run(function($rootScope, $ionicPlatform, $ionicModal, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicLoading, $state, $timeout, $ionicHistory, $ionicPopup, Notification, User, Profile, Auth) {
  return $ionicPlatform.ready(function() {

	var notificationOpenedCallback = function(jsonData) {
		alert('notificationOpenedCallback: ' + JSON.stringify(jsonData));
	};
	window.plugins.OneSignal
	 .startInit("bf81fd5f-ada4-41ef-bd01-b44ef4cafd45")
	 .endInit();
	 window.plugins.OneSignal
	 .getIds(function(ids) {
		 //alert(JSON.stringify(ids));
		 $rootScope.oneSignalIds = ids;
	 });


    var badges, myDate;
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if (window.cordova && window.StatusBar) {
      StatusBar.styleLightContent();
    }
    if (window.cordova && window.cordova.InAppBrowser) {
      window.open = window.cordova.InAppBrowser.open;
    }
    myDate = new Date();
    $rootScope.max_birth_date = new Date(myDate.getFullYear() - 13, myDate.getMonth(), myDate.getDate());
    $rootScope.showProfileDialog = function(user_id) {
      return Profile.showProfileDialog(user_id).then(function(resp) {
        return $ionicModal.fromTemplateUrl('templates/profile_dialog.html', {
          animation: 'slide-in-up',
          scope: $rootScope
        }).then(function(modal) {
          $rootScope.profileModal = modal;
          $rootScope.profileModal.profile = resp.data;
          return $rootScope.profileModal.show();
        });
      });
    };
    $rootScope.closeProfileModal = function() {
      return $rootScope.profileModal.hide();
    };
    $rootScope.showTerms = function() {
      return window.open('http://www.pick-app.it/#/terms');
    };
    $rootScope.$on('loading:show', function() {
      return $ionicLoading.show({
        duration: 5000
      });
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
    $rootScope.goto_search_rooms = function(search_form) {
      return $state.go("app.rooms_search", {
        search_term: search_form.search_term
      });
    };
    $rootScope.askForLogout = function() {
      return Auth.askForLogout();
    };
    $rootScope.showAlert = function(title, text) {
      $ionicLoading.hide();
      return $ionicPopup.alert({
        title: title,
        template: text
      });
    };
    $rootScope.clearHistory = function() {
      return $ionicHistory.clearHistory();
    };
    return Auth.init();
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

angular.module('pickapp').config(function($stateProvider, $urlRouterProvider, $httpProvider, $authProvider, $logProvider, auth_base, $ionicCloudProvider, $ionicConfigProvider) {
  var omniauth_window_type, storage_type;
  $logProvider.debugEnabled(false);
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
  });
  $ionicConfigProvider.backButton.text(false);
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.backButton.icon('ion-arrow-left-c');
  $ionicConfigProvider.spinner.icon('spiral');
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        if (!(config.url.indexOf('public_messages') !== -1) && !(config.url.indexOf('travel_requests') !== -1) && !(config.url.indexOf('private_messages') !== -1) && !(config.url.indexOf('check_for_available_email') !== -1)) {
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
  storage_type = null;
  omniauth_window_type = null;
  if (window.location.protocol === 'http:') {
    storage_type = 'cookies';
    omniauth_window_type = 'sameWindow';
  } else {
    storage_type = 'localStorage';
    omniauth_window_type = 'inAppBrowser';
  }
  $authProvider.configure({
    apiUrl: auth_base,
    storage: storage_type,
    omniauthWindowType: omniauth_window_type,
    authProviderPaths: {
      facebook: '/auth/facebook'
    }
  });
  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    views: {
      'appContent': {
        templateUrl: 'templates/menu.html'
      }
    }
  });
  $stateProvider.state('app.home', {
    url: '/home',
    views: {
      'home-tab': {
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
      }
    }
  });
  $stateProvider.state('app.profile', {
    url: '/profile',
    views: {
      'profile-tab': {
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
  $stateProvider.state('app.profile_travels', {
    url: '/profile_travels/:travels',
    views: {
      'profile-tab': {
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
  $stateProvider.state('app.notifications', {
    url: '/notifications',
    views: {
      'notifications-tab': {
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
      'profile-tab': {
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
  $stateProvider.state('app.profile_travel', {
    url: '/profile_travel/:travel_id',
    views: {
      'profile-tab': {
        templateUrl: 'templates/travel.html',
        controller: 'TravelController',
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
      'profile-tab': {
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
      'rooms-tab': {
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
  $stateProvider.state('app.room_travels_search', {
    url: '/room/:room_id/travels_search',
    views: {
      'rooms-tab': {
        templateUrl: 'templates/room_travels_search.html',
        controller: 'RoomTravelsSearchController',
        resolve: {
          auth: function($auth) {
            return $auth.validateUser();
          }
        }
      }
    }
  });
  $stateProvider.state('app.rooms_search', {
    url: '/search/:search_term?',
    views: {
      'home-tab': {
        templateUrl: 'templates/rooms_search.html',
        controller: 'RoomsSearchController',
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
      'rooms-tab': {
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
      'rooms-tab': {
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
    cache: false,
    views: {
      'rooms-tab': {
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
    cache: false,
    views: {
      'rooms-tab': {
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
    url: '/rooms/:room_id/room_request/:travel_id',
    views: {
      'rooms-tab': {
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
    url: '/rooms/:room_id/room_offer/:travel_id/public_chat/:open_public_chat?/private_chat/:open_private_chat?',
    views: {
      'rooms-tab': {
        templateUrl: 'templates/travel.html',
        controller: 'TravelController',
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
  $scope.display_text = {
    driver_payoff: "Offri i tuoi posti liberi in auto ad altri utenti di PickApp per tutti i tuoi viaggi nelle Vrooms. Viaggia in compagnia in completa sicurezza!",
    passenger_payoff: "Scegli tra le Vrooms la tua destinazione preferita e cerca un passaggio: è semplice, affidabile e divertente.",
    pickapp_payoff: "Noi controlliamo la veridicità di patente e assicurazione dei guidatori, tu puoi recensire gli utenti affidabili e segnalare se qualcuno non rispetta le regole. Il carpooling non è mai stato così sicuro!"
  };
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
  return $scope.convertUrl = function(notification) {
    var room_id, splitted_url, travel_id, travel_offer_id, url;
    if (notification) {
      if (notification.link) {
        url = notification.link;
        console.log(url);
        url = url.replace('#/', '');
        splitted_url = url.split('/');
        if (splitted_url[0] === "rooms") {
          room_id = parseInt(splitted_url[1]);
          if (splitted_url[2] === "travels") {
            travel_offer_id = parseInt(splitted_url[3]);
            if (notification.is_message) {
              if (notification.title === "Hai ricevuto un messaggio pubblico!") {
                $state.go('app.room_offer', {
                  room_id: room_id,
                  travel_id: travel_offer_id,
                  open_public_chat: 'true'
                });
              } else {
                $state.go('app.room_offer', {
                  room_id: room_id,
                  travel_id: travel_offer_id,
                  open_private_chat: parseInt(splitted_url[5])
                });
              }
            } else {
              $state.go('app.room_offer', {
                room_id: room_id,
                travel_id: travel_offer_id
              });
            }
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
              travel_id: travel_id
            });
          }
        }
      } else {
        if (notification.title === "Aggiungi un'auto!" || notification.title === "Sei diventato un driver!") {
          return $state.go('app.cars');
        }
      }
    }
  };
});

angular.module('pickapp').controller('ProfileController', function($scope, $state, $rootScope, $interval, $ionicLoading, $ionicActionSheet, $ionicPlatform, $ionicModal, $ionicPopup, $auth, User) {
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
        targetWidth: 800,
        targetHeight: 800,
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
    User.getLatestReviewsAsTarget($rootScope.user.id).then(function(resp) {
      return $scope.latest_reviews = resp.data;
    });
    return console.log($rootScope.user);
  };
  getData();
  $ionicModal.fromTemplateUrl('edit-profile-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.editProfileModal = modal;
    $scope.newBirthDatePicker = function() {
      var date_picker_options, onError, onSuccess;
      date_picker_options = {
        date: $rootScope.user.birth_date || new Date(),
        mode: 'date',
        locale: 'it_IT',
        cancelText: 'Annulla',
        okText: 'Conferma',
        cancelButtonLabel: 'Annulla',
        doneButtonLabel: 'Conferma'
      };
      onSuccess = function(date) {
        $scope.editForm.birth_date = date;
        return $scope.$apply();
      };
      onError = function(error) {};
      return datePicker.show(date_picker_options, onSuccess, onError);
    };
    $scope.editForm = {
      birth_date: $rootScope.user.birth_date,
      prov: $rootScope.user.prov,
      comune: $rootScope.user.comune,
      address: $rootScope.user.address,
      zip_code: $rootScope.user.zip_code
    };
    $scope.dati_italia = anagrafica;
    return $scope.updateProfile = function() {
      return $auth.updateAccount($scope.editForm).then(function(resp) {
        var alertPopup;
        alertPopup = $ionicPopup.alert({
          title: 'Profilo aggiornato',
          template: 'Il tuo profilo è stato aggiornato con successo!'
        });
        return $scope.editProfileModal.hide();
      })["catch"](function(resp) {
        var alertPopup;
        alertPopup = $ionicPopup.alert({
          title: 'Errore',
          template: 'C\'è stato un problema durante l\'aggiornamento del profilo, contatta l\'assistenza.'
        });
        return $scope.editProfileModal.hide();
      });
    };
  });
  $scope.showEditProfileModal = function() {
    return $scope.editProfileModal.show();
  };
  $scope.closeEditProfileModal = function() {
    return $scope.editProfileModal.hide();
  };
  return $scope.deleteAccount = function(ev) {
    var confirmPopup;
    confirmPopup = $ionicPopup.confirm({
      title: 'Eliminazione Account',
      template: 'Vuoi eliminare l\'account?',
      cancelText: 'No',
      okText: 'Sì'
    });
    return confirmPopup.then(function(res) {
      if (res) {
        return $auth.destroyAccount().then(function(resp) {
          $rootScope.user = {};
          return $state.go('home');
        })["catch"](function(resp) {});
      }
    });
  };
});

angular.module('pickapp').controller('ProfileDriverController', function($scope, $rootScope, $ionicPlatform, $ionicActionSheet, $ionicLoading, DriverDetail, $ionicScrollDelegate, User) {
  $scope.dati_italia = anagrafica;
  $scope.driverDetails = {};
  $scope.pullUpdate = function() {
    return User.fetchUserInfo($rootScope.user.id).then(function(resp) {
      $rootScope.user = resp.data;
      return $scope.$broadcast('scroll.refreshComplete');
    });
  };
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
    if ($scope.driverDetails.accept_terms) {
      $scope.driverDetails.user_id = $rootScope.user.id;
      return DriverDetail.createDriverDetail($scope.driverDetails).then(function(resp) {
        $rootScope.showAlert('Grazie', 'Abbiamo ricevuto i tuoi dati, se è tutto ok a breve verrai confermato!');
        $ionicScrollDelegate.$getByHandle('profile_driver_scroller').scrollTop();
        return User.fetchUserInfo($rootScope.user.id).then(function(resp) {
          return $rootScope.user = resp.data;
        });
      }, function(error) {
        return $rootScope.showAlert('Errore', 'Compila tutti i dati necessari!');
      });
    }
  };
});

angular.module('pickapp').controller('ProfileTravelController', function($scope, $rootScope, $stateParams, User) {
  var getData;
  getData = function() {
    return User.getTravelForUser($rootScope.user.id, $stateParams.travel_id).then(function(resp) {
      $scope.travel = resp.data;
      return console.log(resp.data);
    });
  };
  getData();
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  return $scope.markTravelAsCompleted = function() {
    return User.markTravelAsCompleted($rootScope.user.id, $stateParams.travel_id).then(function(resp) {
      return $scope.travel = resp.data;
    });
  };
});

angular.module('pickapp').controller('ProfileTravelsController', function($scope, $rootScope, $stateParams, User) {
  $scope.display_completed_travels = false;
  $scope.shouldDisplayTravel = function(travel_dep_datetime) {
    return new Date(travel_dep_datetime) >= new Date();
  };
  $scope.toggleCompletedTravels = function() {
    return $scope.display_completed_travels = !$scope.display_completed_travels;
  };
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

angular.module('pickapp').controller('RoomController', function($ionicPlatform, $scope, $rootScope, $stateParams, $ionicModal, $ionicHistory, Room, User, Car, TravelRequest, Travel) {
  $ionicPlatform.ready(function() {});
  if (window.cordova && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.disableScroll(true);
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
  }
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
  $scope.newTravelRequest = {
    towards_room: true
  };
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
    if ($scope.newTravelRequest.starting_address_addr && $scope.newTravelRequest.starting_address_city && $scope.newTravelRequest.starting_address_cap) {
      $scope.newTravelRequest.starting_address = $scope.newTravelRequest.starting_address_addr + " " + $scope.newTravelRequest.starting_address_city + " " + $scope.newTravelRequest.starting_address_cap;
      $scope.newTravelRequest.desired_address = $scope.newTravelRequest.starting_address_addr;
      $scope.newTravelRequest.city = $scope.newTravelRequest.starting_address_city;
      $scope.newTravelRequest.zip_code = $scope.newTravelRequest.starting_address_cap;
      return TravelRequest.createTravelRequest($scope.room.id, $scope.newTravelRequest).then(function(resp) {
        console.log(resp.data);
        $scope.closeTravelRequestModal();
        $scope.newTravelRequest = {};
        return $rootScope.showAlert('Congratulazioni', 'Richiesta di passaggio inserita correttamente.');
      });
    }
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
  $scope.newTravelOffer = {
    towards_room: true
  };
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
    if ($scope.newTravelOffer.departure_datetime && $scope.newTravelOffer.user_address_addr && $scope.newTravelOffer.user_address_city && $scope.newTravelOffer.user_address_cap && $scope.newTravelOffer.car_id) {
      $scope.newTravelOffer.user_address = $scope.newTravelOffer.user_address_addr + " " + $scope.newTravelOffer.user_address_city + " " + $scope.newTravelOffer.user_address_cap;
      $scope.newTravelOffer.driver_id = $rootScope.user.id;
      $scope.newTravelOffer.room_id = $scope.room.id;
      $scope.newTravelOffer.repetions_amount = $scope.newTravelOffer.repetitions_amount;
      return Travel.createTravel($scope.room.id, $scope.newTravelOffer).then(function(resp) {
        $scope.newTravelOffer = {};
        $scope.newTravelOffer.travel_stops = [];
        $scope.closeTravelOfferModal();
        return $rootScope.showAlert('Congratulazioni', 'Offerta di passaggio inserita correttamente.');
      });
    } else {
      return $rootScope.showAlert('Errore', 'Compila tutto il form per continuare.');
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
      Room.makeRoomFavourite($stateParams.room_id).then(function(resp) {
        $scope.room.is_favourite = resp.data;
        return User.getPreferredRooms($rootScope.user.id).then(function(resp) {
          return $rootScope.user.preferred_rooms = resp.data;
        });
      });
    } else {
      Room.unmakeRoomFavourite($stateParams.room_id).then(function(resp) {
        $scope.room.is_favourite = resp.data;
        return User.getPreferredRooms($rootScope.user.id).then(function(resp) {
          return $rootScope.user.preferred_rooms = resp.data;
        });
      });
    }
    return Room.getRoom($stateParams.room_id).then(function(resp) {
      return $scope.room = resp.data;
    });
  };
});

angular.module('pickapp').controller('RoomOfferController', function($scope, $rootScope, $interval, $ionicPlatform, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicModal, Room, Travel, PublicMessage, PrivateChat, PrivateMessage) {
  var getChatData, getData, getPrivateChatData, keepKeyboardOpen, messages_interval;
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
      return cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
  });
  $scope.pullUpdate = function() {
    getData();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  getData = function() {
    $ionicLoading.show();
    return Travel.getTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      $scope.travel_offer = resp.data;
      $ionicLoading.hide();
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
  $ionicModal.fromTemplateUrl('travel-stops-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.travelStopsModal = modal;
  });
  $scope.showTravelStopsModal = function() {
    return $scope.travelStopsModal.show();
  };
  $scope.closeTravelStopsModal = function() {
    return $scope.travelStopsModal.hide();
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
  $scope.getPrivateChat = function(private_chat_id) {
    $scope.private_chat_id = private_chat_id;
    return $scope.openPrivateChat();
  };
  return $scope.destroyTravel = function() {
    var confirmPopup;
    confirmPopup = $ionicPopup.confirm({
      title: 'Elimina Richiesta',
      template: 'Sei sicuro di voler eliminare questa offerta?'
    });
    return confirmPopup.then(function(res) {
      if (res) {
        return Travel.destroyTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
          return $ionicHistory.goBack();
        });
      }
    });
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
      $scope.room = resp.data;
      return console.log(resp.data);
    });
  };
  return getData();
});

angular.module('pickapp').controller('RoomTravelsSearchController', function(Room, $scope, $rootScope, $stateParams) {
  $scope.toggle_list_type = true;
  $scope.travelSearch = {};
  $scope.search_panel_open = true;
  $scope.togglePanel = function() {
    return $scope.search_panel_open = !$scope.search_panel_open;
  };
  Room.getRoom($stateParams.room_id).then(function(resp) {
    $scope.room = resp.data;
    return $scope.travels = resp.data.travels;
  });
  $scope.newTravelOfferDatePicker = function() {
    var date_picker_options, onError, onSuccess;
    date_picker_options = {
      date: $scope.travelSearch.min_departure_datetime || new Date(),
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
      $scope.travelSearch.min_departure_datetime = date;
      return $scope.$apply();
    };
    onError = function(error) {};
    return datePicker.show(date_picker_options, onSuccess, onError);
  };
  $scope.newTravelOfferBackDatePicker = function() {
    var date_picker_options, onError, onSuccess;
    date_picker_options = {
      date: $scope.travelSearch.max_departure_datetime || new Date(),
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
      $scope.travelSearch.max_departure_datetime = date;
      return $scope.$apply();
    };
    onError = function(error) {};
    return datePicker.show(date_picker_options, onSuccess, onError);
  };
  $scope.searchTravels = function() {
    return Room.searchTravels($stateParams.room_id, $scope.travelSearch).then(function(resp) {
      $scope.found_travels = resp.data;
      return $scope.search_panel_open = false;
    });
  };
  return $scope.searchTravels();
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

angular.module('pickapp').controller('RoomsSearchController', function(Room, $scope, $rootScope, $stateParams) {
  $scope.search_term = '';
  $scope.search_rooms = function(search_term) {
    return Room.searchRooms(search_term).then(function(resp) {
      $scope.search_results = resp.data;
      return console.log(resp.data);
    });
  };
  if ($stateParams.search_term) {
    $scope.search_term = $stateParams.search_term;
    return $scope.search_rooms($scope.search_term);
  }
});

angular.module('pickapp').controller('TravelController', function($scope, $rootScope, $interval, $timeout, $ionicPlatform, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicModal, User, Room, Travel, PublicMessage, PrivateChat, PrivateMessage, TravelReview) {
  var getChatData, getData, getDataForUser, getPrivateChatData, keepKeyboardOpen, messages_interval, parseTravel;
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
      return cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
  });
  getData = function() {
    $ionicLoading.show();
    return Travel.getTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      $scope.travel = resp.data;
      console.log(resp.data);
      console.log($scope.travel, 'travel');
      $ionicLoading.hide();
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
      $scope.marker = {
        id: 0,
        coords: {
          latitude: resp.data.starting_lat,
          longitude: resp.data.starting_lng
        },
        options: {
          draggable: false
        }
      };
      $scope.room_id = $stateParams.room_id;
      return $scope.travel_id = $stateParams.travel_id;
    });
  };
  getDataForUser = function() {
    $ionicLoading.show();
    return User.getTravelForUser($rootScope.user.id, $stateParams.travel_id).then(function(resp) {
      $scope.travel = resp.data;
      console.log(resp.data);
      $ionicLoading.hide();
      console.log($scope.travel, 'user');
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
      $scope.marker = {
        id: 0,
        coords: {
          latitude: resp.data.starting_lat,
          longitude: resp.data.starting_lng
        },
        options: {
          draggable: false
        }
      };
      $scope.travel_id = $stateParams.travel_id;
      return $scope.room_id = $scope.travel.room.id;
    });
  };
  parseTravel = function() {
    if ($stateParams.room_id) {
      return getData();
    } else {
      return getDataForUser();
    }
  };
  $scope.pullUpdate = function() {
    parseTravel();
    return $scope.$broadcast('scroll.refreshComplete');
  };
  parseTravel();
  getChatData = function() {
    return PublicMessage.getPublicMessagesForTravel($stateParams.room_id, $stateParams.travel_id).then(function(resp) {
      return $scope.travel.public_messages = resp.data;
    });
  };
  $scope.checkTravelDate = function() {
    if ($scope.travel) {
      return new Date($scope.travel.departure_datetime) > new Date();
    }
  };
  $scope.applyForTravel = function() {
    return Travel.applyUser($scope.room_id, $scope.travel_id, $rootScope.user.id).then(function(resp) {
      $scope.travel = resp.data;
      return $rootScope.showAlert('Attenzione', 'Verifica sul sito del ministero la targa del guidatore per ulteriori informazioni. <a href="https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-copertura-rc">https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-copertura-rc</a>');
    });
  };
  $scope.cancelApplicationForTravel = function() {
    return Travel.cancelApplicationForTravel($scope.room_id, $scope.travel_id, $rootScope.user.id).then(function(resp) {
      return $scope.travel.is_applied = resp.data;
    });
  };
  $scope.approveForTravel = function(user_id) {
    return Travel.approveUser($scope.room_id, $scope.travel_id, user_id).then(function(resp) {
      return $scope.travel = resp.data;
    });
  };
  $scope.cancelApprovalForTravel = function(user_id) {
    return Travel.cancelApprovalForUser($scope.room_id, $scope.travel_id, user_id).then(function(resp) {
      return $scope.travel = resp.data;
    });
  };
  $scope.markTravelAsCompleted = function() {
    return User.markTravelAsCompleted($rootScope.user.id, $scope.travel_id).then(function(resp) {
      return $scope.travel = resp.data;
    });
  };
  $scope.destroyTravel = function() {
    var confirmPopup;
    confirmPopup = $ionicPopup.confirm({
      title: 'Elimina Offerta',
      template: 'Sei sicuro di voler eliminare questa offerta?'
    });
    return confirmPopup.then(function(res) {
      if (res) {
        return Travel.destroyTravel($scope.room_id, $scope.travel_id).then(function(resp) {
          $ionicHistory.goBack();
          return $rootScope.showToast("Offerta cancellata con successo con successo");
        });
      }
    });
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
  $timeout(function() {
    if ($stateParams.open_public_chat === 'true') {
      return $scope.openChat();
    }
  }, 500);
  $scope.closeChatModal = function() {
    $interval.cancel(messages_interval);
    return $scope.chatModal.hide();
  };
  keepKeyboardOpen = function() {
    console.log('keepKeyboardOpen');
    return txtInput.one('blur', function() {
      console.log('textarea blur, focus back on it');
      return txtInput[0].focus();
    });
  };
  $scope.newTravelOfferMessage = {};
  $scope.handleMessageNewClick = function(room_id, travel_offer_id) {
    $scope.newTravelOfferMessage.author_id = $rootScope.user.id;
    $scope.newTravelOfferMessage.travel_id = $scope.travel.id;
    if ($scope.travel.is_owner) {
      $scope.newTravelOfferMessage.is_request_owner = true;
    }
    return PublicMessage.createPublicMessage($scope.newTravelOfferMessage, $scope.travel.room.id, travel_offer_id).then(function(resp) {
      $scope.newTravelOfferMessage.content = null;
      return $scope.travel.public_messages = resp.data;
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
    return PrivateMessage.getMessagesForPrivateChat($scope.travel.room.id, $scope.travel.id, $scope.private_chat_id).then(function(resp) {
      $scope.private_messages = resp.data;
      return console.log(resp.data);
    });
  };
  $timeout(function() {
    if ($stateParams.open_private_chat) {
      $scope.private_chat_id = $stateParams.open_private_chat;
      return $scope.openPrivateChat();
    }
  }, 500);
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
  $scope.handlePrivateMessageNewClick = function(room_id, travel_id) {
    $scope.newTravelOfferPrivateMessage.author_id = $rootScope.user.id;
    $scope.newTravelOfferPrivateMessage.private_chat_id = $scope.private_chat_id;
    if ($scope.travel.is_owner) {
      $scope.newTravelOfferPrivateMessage.is_request_owner = true;
    }
    return PrivateMessage.createMessage($scope.newTravelOfferPrivateMessage, $scope.travel.room.id, $scope.travel.id, $scope.private_chat_id).then(function(resp) {
      $scope.newTravelOfferPrivateMessage.content = null;
      return $scope.private_messages = resp.data;
    });
  };
  $scope.createPrivateChat = function() {
    return PrivateChat.createPrivateChat($scope.travel.driver.id, $scope.travel.room.id, $scope.travel.id).then(function(resp) {
      $scope.private_chat_id = resp.data;
      $scope.openPrivateChat($scope.private_chat_id);
      return getData();
    });
  };
  $scope.getPrivateChat = function(private_chat_id) {
    $scope.private_chat_id = private_chat_id;
    return $scope.openPrivateChat();
  };
  $scope.reviewsToSubmit = [];
  return $scope.handleReviewNewClick = function(travel_id, review_id, review_data) {
    return TravelReview.updateReviewForTravel($rootScope.user.id, travel_id, review_id, review_data).then(function(resp) {
      var x;
      $scope.travel.reviews_done.unshift(resp.data);
      $scope.travel.reviews_to_be_done = (function() {
        var i, len, ref, results;
        ref = $scope.travel.reviews_to_be_done;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          x = ref[i];
          if (x.id !== resp.data.id) {
            results.push(x);
          }
        }
        return results;
      })();
      return $state.go($state.current, {
        travel_id: travel_id
      }, {
        reload: true
      });
    });
  };
});

angular.module('pickapp').controller('WelcomeController', function($scope, $rootScope, $timeout, $ionicPopup, $auth, $ionicHistory, $ionicModal, $ionicActionSheet, $ionicPlatform, $cordovaCamera) {
  $scope.dati_italia = anagrafica;
  $ionicModal.fromTemplateUrl('info-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    return $scope.infoModal = modal;
  });
  $scope.showInfoModal = function() {
    return $scope.infoModal.show();
  };
  $scope.closeInfoModal = function() {
    return $scope.infoModal.hide();
  };
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
  $rootScope.$on('auth:registration-email-error', function() {
    if ($scope.registerModal.password !== $scope.registerModal.password_confirmation) {
      return $rootScope.showAlert('Errore', 'Le password non coincidono');
    } else {
      return $rootScope.showAlert('Errore', 'Devi compilare tutti i campi per completare la registrazione!');
    }
  });
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
  return $ionicPlatform.ready(function() {
    return $scope.facebook_auth = function() {
      var fail, success;
      success = function(data) {
        if (data.status === 'connected') {
          return facebookConnectPlugin.api("/me?fields=id,email,last_name,first_name", ['email', 'public_profile'], function(data) {
            return $auth.submitFacebookLogin({
              user: data
            });
          }, function(error) {
            return console.log(error);
          });
        }
      };
      fail = function(data) {
        return console.log(data);
      };
      return facebookConnectPlugin.login(['public_profile', 'email'], success, fail);
    };
  });
});

angular.module('pickapp').directive('confirmEmail', function($interpolate, $parse, User) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModelCtrl) {
      var email, emailFn;
      email = $parse(attr.confirmEmail);
      emailFn = $interpolate(attr.confirmEmail)(scope);
      scope.$watch(emailFn, function(newVal) {
        return User.checkForAvailableEmail(newVal).then(function(resp) {
          return ngModelCtrl.$setValidity('email', resp.data.available);
        });
      });
      return ngModelCtrl.$validators.email = function(modelValue, viewValue) {
        return true;
      };
    }
  };
});

angular.module('pickapp').directive('confirmPwd', function($interpolate, $parse) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModelCtrl) {
      var pwdFn, pwdToMatch;
      pwdToMatch = $parse(attr.confirmPwd);
      pwdFn = $interpolate(attr.confirmPwd)(scope);
      scope.$watch(pwdFn, function(newVal) {
        return ngModelCtrl.$setValidity('password', ngModelCtrl.$viewValue === newVal);
      });
      return ngModelCtrl.$validators.password = function(modelValue, viewValue) {
        var value;
        value = modelValue || viewValue;
        return value === pwdToMatch(scope);
      };
    }
  };
});

(function(ionic) {
  angular.module('ionic.contrib.ui.hscrollcards', ['ionic']).directive('hscroller', [
    '$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: '<div class="hscroller" ng-transclude></div>',
        replace: true,
        transclude: true,
        compile: function(element, attr) {
          return function($scope, $element, $attr) {
            var el;
            el = $element[0];
            return angular.element($element).bind('scroll', function() {
              var left;
              return left = $element[0].scrollLeft;
            });
          };
        }
      };
    }
  ]).directive('hcard', [
    '$rootScope', function($rootScope) {
      return {
        restrict: 'E',
        template: '<div class="hscroller-card" ng-transclude></div>',
        replace: true,
        transclude: true,
        scope: {
          desc: '@'
        },
        link: function(scope, element, attrs) {
          var name;
          name = angular.element("<span>" + attrs.desc + "</span>");
          return element.append(name);
        }
      };
    }
  ]);
})(window.ionic);



if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'ng-token-auth';
}

angular.module('ng-token-auth', ['ipCookie']).provider('$auth', function() {
  var configs, defaultConfigName;
  configs = {
    "default": {
      apiUrl: '/api',
      signOutUrl: '/auth/sign_out',
      emailSignInPath: '/auth/sign_in',
      facebookSignInPath: '/auth/facebook_login',
      emailRegistrationPath: '/auth',
      accountUpdatePath: '/auth',
      accountDeletePath: '/auth',
      confirmationSuccessUrl: function() {
        return window.location.href;
      },
      passwordResetPath: '/auth/password',
      passwordUpdatePath: '/auth/password',
      passwordResetSuccessUrl: function() {
        return window.location.href;
      },
      tokenValidationPath: '/auth/validate_token',
      proxyIf: function() {
        return false;
      },
      proxyUrl: '/proxy',
      validateOnPageLoad: true,
      omniauthWindowType: 'sameWindow',
      storage: 'cookies',
      forceValidateToken: false,
      tokenFormat: {
        "access-token": "{{ token }}",
        "token-type": "Bearer",
        client: "{{ clientId }}",
        expiry: "{{ expiry }}",
        uid: "{{ uid }}"
      },
      cookieOps: {
        path: "/",
        expires: 9999,
        expirationUnit: 'days',
        secure: false
      },
      createPopup: function(url) {
        return window.open(url, '_blank', 'closebuttoncaption=Cancel');
      },
      parseExpiry: function(headers) {
        return (parseInt(headers['expiry'], 10) * 1000) || null;
      },
      handleLoginResponse: function(resp) {
        return resp.data;
      },
      handleAccountUpdateResponse: function(resp) {
        return resp.data;
      },
      handleTokenValidationResponse: function(resp) {
        return resp.data;
      },
      authProviderPaths: {
        github: '/auth/github',
        facebook: '/auth/facebook',
        google: '/auth/google_oauth2'
      }
    }
  };
  defaultConfigName = "default";
  return {
    configure: function(params) {
      var conf, defaults, fullConfig, i, j, k, label, len, v;
      if (params instanceof Array && params.length) {
        for (i = j = 0, len = params.length; j < len; i = ++j) {
          conf = params[i];
          label = null;
          for (k in conf) {
            v = conf[k];
            label = k;
            if (i === 0) {
              defaultConfigName = label;
            }
          }
          defaults = angular.copy(configs["default"]);
          fullConfig = {};
          fullConfig[label] = angular.extend(defaults, conf[label]);
          angular.extend(configs, fullConfig);
        }
        if (defaultConfigName !== "default") {
          delete configs["default"];
        }
      } else if (params instanceof Object) {
        angular.extend(configs["default"], params);
      } else {
        throw "Invalid argument: ng-token-auth config should be an Array or Object.";
      }
      return configs;
    },
    $get: [
      '$http', '$q', '$location', 'ipCookie', '$window', '$timeout', '$rootScope', '$interpolate', '$interval', (function(_this) {
        return function($http, $q, $location, ipCookie, $window, $timeout, $rootScope, $interpolate, $interval) {
          return {
            header: null,
            dfd: null,
            user: {},
            mustResetPassword: false,
            listener: null,
            initialize: function() {
              this.initializeListeners();
              this.cancelOmniauthInAppBrowserListeners = (function() {});
              return this.addScopeMethods();
            },
            initializeListeners: function() {
              this.listener = angular.bind(this, this.handlePostMessage);
              if ($window.addEventListener) {
                return $window.addEventListener("message", this.listener, false);
              }
            },
            cancel: function(reason) {
              if (this.requestCredentialsPollingTimer != null) {
                $timeout.cancel(this.requestCredentialsPollingTimer);
              }
              this.cancelOmniauthInAppBrowserListeners();
              if (this.dfd != null) {
                this.rejectDfd(reason);
              }
              return $timeout(((function(_this) {
                return function() {
                  return _this.requestCredentialsPollingTimer = null;
                };
              })(this)), 0);
            },
            destroy: function() {
              this.cancel();
              if ($window.removeEventListener) {
                return $window.removeEventListener("message", this.listener, false);
              }
            },
            handlePostMessage: function(ev) {
              var error, oauthRegistration;
              if (ev.data.message === 'deliverCredentials') {
                delete ev.data.message;
                oauthRegistration = ev.data.oauth_registration;
                delete ev.data.oauth_registration;
                this.handleValidAuth(ev.data, true);
                $rootScope.$broadcast('auth:login-success', ev.data);
                if (oauthRegistration) {
                  $rootScope.$broadcast('auth:oauth-registration', ev.data);
                }
              }
              if (ev.data.message === 'authFailure') {
                error = {
                  reason: 'unauthorized',
                  errors: [ev.data.error]
                };
                this.cancel(error);
                return $rootScope.$broadcast('auth:login-error', error);
              }
            },
            addScopeMethods: function() {
              $rootScope.user = this.user;
              $rootScope.authenticate = angular.bind(this, this.authenticate);
              $rootScope.signOut = angular.bind(this, this.signOut);
              $rootScope.destroyAccount = angular.bind(this, this.destroyAccount);
              $rootScope.submitRegistration = angular.bind(this, this.submitRegistration);
              $rootScope.submitLogin = angular.bind(this, this.submitLogin);
              $rootScope.requestPasswordReset = angular.bind(this, this.requestPasswordReset);
              $rootScope.updatePassword = angular.bind(this, this.updatePassword);
              $rootScope.updateAccount = angular.bind(this, this.updateAccount);
              if (this.getConfig().validateOnPageLoad) {
                return this.validateUser({
                  config: this.getSavedConfig()
                });
              }
            },
            submitRegistration: function(params, opts) {
              var successUrl;
              if (opts == null) {
                opts = {};
              }
              successUrl = this.getResultOrValue(this.getConfig(opts.config).confirmationSuccessUrl);
              angular.extend(params, {
                confirm_success_url: successUrl,
                config_name: this.getCurrentConfigName(opts.config)
              });
              return $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).emailRegistrationPath, params).success(function(resp) {
                return $rootScope.$broadcast('auth:registration-email-success', params);
              }).error(function(resp) {
                return $rootScope.$broadcast('auth:registration-email-error', resp);
              });
            },
            submitLogin: function(params, opts, httpopts) {
              if (opts == null) {
                opts = {};
              }
              if (httpopts == null) {
                httpopts = {};
              }
              this.initDfd();
              $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).emailSignInPath, params, httpopts).success((function(_this) {
                return function(resp) {
                  var authData;
                  console.log(resp);
                  _this.setConfigName(opts.config);
                  authData = _this.getConfig(opts.config).handleLoginResponse(resp, _this);
                  _this.handleValidAuth(authData);
                  return $rootScope.$broadcast('auth:login-success', _this.user);
                };
              })(this)).error((function(_this) {
                return function(resp) {
                  _this.rejectDfd({
                    reason: 'unauthorized',
                    errors: ['Invalid credentials']
                  });
                  return $rootScope.$broadcast('auth:login-error', resp);
                };
              })(this));
              return this.dfd.promise;
            },
            submitFacebookLogin: function(params, opts, httpopts) {
              if (opts == null) {
                opts = {};
              }
              if (httpopts == null) {
                httpopts = {};
              }
              this.initDfd();
              $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).facebookSignInPath, params, httpopts).success((function(_this) {
                return function(resp) {
                  var authData;
                  console.log(resp);
                  _this.setConfigName(opts.config);
                  authData = _this.getConfig(opts.config).handleLoginResponse(resp, _this);
                  _this.handleValidAuth(authData);
                  return $rootScope.$broadcast('auth:login-success', _this.user);
                };
              })(this)).error((function(_this) {
                return function(resp) {
                  _this.rejectDfd({
                    reason: 'unauthorized',
                    errors: ['Invalid credentials']
                  });
                  return $rootScope.$broadcast('auth:login-error', resp);
                };
              })(this));
              return this.dfd.promise;
            },
            userIsAuthenticated: function() {
              return this.retrieveData('auth_headers') && this.user.signedIn && !this.tokenHasExpired();
            },
            requestPasswordReset: function(params, opts) {
              var successUrl;
              if (opts == null) {
                opts = {};
              }
              successUrl = this.getResultOrValue(this.getConfig(opts.config).passwordResetSuccessUrl);
              params.redirect_url = successUrl;
              if (opts.config != null) {
                params.config_name = opts.config;
              }
              return $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).passwordResetPath, params).success(function(resp) {
                return $rootScope.$broadcast('auth:password-reset-request-success', params);
              }).error(function(resp) {
                return $rootScope.$broadcast('auth:password-reset-request-error', resp);
              });
            },
            updatePassword: function(params) {
              return $http.put(this.apiUrl() + this.getConfig().passwordUpdatePath, params).success((function(_this) {
                return function(resp) {
                  $rootScope.$broadcast('auth:password-change-success', resp);
                  return _this.mustResetPassword = false;
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:password-change-error', resp);
              });
            },
            updateAccount: function(params) {
              return $http.put(this.apiUrl() + this.getConfig().accountUpdatePath, params).success((function(_this) {
                return function(resp) {
                  var curHeaders, key, newHeaders, ref, updateResponse, val;
                  updateResponse = _this.getConfig().handleAccountUpdateResponse(resp);
                  curHeaders = _this.retrieveData('auth_headers');
                  angular.extend(_this.user, updateResponse);
                  if (curHeaders) {
                    newHeaders = {};
                    ref = _this.getConfig().tokenFormat;
                    for (key in ref) {
                      val = ref[key];
                      if (curHeaders[key] && updateResponse[key]) {
                        newHeaders[key] = updateResponse[key];
                      }
                    }
                    _this.setAuthHeaders(newHeaders);
                  }
                  return $rootScope.$broadcast('auth:account-update-success', resp);
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:account-update-error', resp);
              });
            },
            destroyAccount: function(params) {
              return $http["delete"](this.apiUrl() + this.getConfig().accountUpdatePath, params).success((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:account-destroy-success', resp);
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:account-destroy-error', resp);
              });
            },
            authenticate: function(provider, opts) {
              if (opts == null) {
                opts = {};
              }
              if (this.dfd == null) {
                this.setConfigName(opts.config);
                this.initDfd();
                this.openAuthWindow(provider, opts);
              }
              return this.dfd.promise;
            },
            setConfigName: function(configName) {
              if (configName == null) {
                configName = defaultConfigName;
              }
              return this.persistData('currentConfigName', configName, configName);
            },
            openAuthWindow: function(provider, opts) {
              var authUrl, omniauthWindowType;
              omniauthWindowType = this.getConfig(opts.config).omniauthWindowType;
              authUrl = this.buildAuthUrl(omniauthWindowType, provider, opts);
              if (omniauthWindowType === 'newWindow') {
                return this.requestCredentialsViaPostMessage(this.getConfig().createPopup(authUrl));
              } else if (omniauthWindowType === 'inAppBrowser') {
                return this.requestCredentialsViaExecuteScript(this.getConfig().createPopup(authUrl));
              } else if (omniauthWindowType === 'sameWindow') {
                return this.visitUrl(authUrl);
              } else {
                throw 'Unsupported omniauthWindowType "#{omniauthWindowType}"';
              }
            },
            visitUrl: function(url) {
              return $window.location.replace(url);
            },
            buildAuthUrl: function(omniauthWindowType, provider, opts) {
              var authUrl, key, params, val;
              if (opts == null) {
                opts = {};
              }
              authUrl = this.getConfig(opts.config).apiUrl;
              authUrl += this.getConfig(opts.config).authProviderPaths[provider];
              authUrl += '?auth_origin_url=' + encodeURIComponent($window.location.href);
              params = angular.extend({}, opts.params || {}, {
                omniauth_window_type: omniauthWindowType
              });
              for (key in params) {
                val = params[key];
                authUrl += '&';
                authUrl += encodeURIComponent(key);
                authUrl += '=';
                authUrl += encodeURIComponent(val);
              }
              return authUrl;
            },
            requestCredentialsViaPostMessage: function(authWindow) {
              if (authWindow.closed) {
                return this.handleAuthWindowClose(authWindow);
              } else {
                authWindow.postMessage("requestCredentials", "*");
                return this.requestCredentialsPollingTimer = $timeout(((function(_this) {
                  return function() {
                    return _this.requestCredentialsViaPostMessage(authWindow);
                  };
                })(this)), 500);
              }
            },
            requestCredentialsViaExecuteScript: function(authWindow) {
              var handleAuthWindowClose, handleLoadStop;
              this.cancelOmniauthInAppBrowserListeners();
              handleAuthWindowClose = this.handleAuthWindowClose.bind(this, authWindow);
              handleLoadStop = this.handleLoadStop.bind(this, authWindow);
              authWindow.addEventListener('loadstop', handleLoadStop);
              authWindow.addEventListener('exit', handleAuthWindowClose);
              return this.cancelOmniauthInAppBrowserListeners = function() {
                authWindow.removeEventListener('loadstop', handleLoadStop);
                return authWindow.removeEventListener('exit', handleAuthWindowClose);
              };
            },
            handleLoadStop: function(authWindow) {
              _this = this;
              return authWindow.executeScript({
                code: 'requestCredentials()'
              }, function(response) {
                var data, ev;
                data = response[0];
                if (data) {
                  ev = new Event('message');
                  ev.data = data;
                  _this.cancelOmniauthInAppBrowserListeners();
                  $window.dispatchEvent(ev);
                  _this.initDfd();
                  return authWindow.close();
                }
              });
            },
            handleAuthWindowClose: function(authWindow) {
              this.cancel({
                reason: 'unauthorized',
                errors: ['User canceled login']
              });
              this.cancelOmniauthInAppBrowserListeners;
              return $rootScope.$broadcast('auth:window-closed');
            },
            resolveDfd: function() {
              this.dfd.resolve(this.user);
              return $timeout(((function(_this) {
                return function() {
                  _this.dfd = null;
                  if (!$rootScope.$$phase) {
                    return $rootScope.$digest();
                  }
                };
              })(this)), 0);
            },
            buildQueryString: function(param, prefix) {
              var encoded, k, str, v;
              str = [];
              for (k in param) {
                v = param[k];
                k = prefix ? prefix + "[" + k + "]" : k;
                encoded = angular.isObject(v) ? this.buildQueryString(v, k) : k + "=" + encodeURIComponent(v);
                str.push(encoded);
              }
              return str.join("&");
            },
            parseLocation: function(location) {
              var i, locationSubstring, obj, pair, pairs;
              locationSubstring = location.substring(1);
              obj = {};
              if (locationSubstring) {
                pairs = locationSubstring.split('&');
                pair = void 0;
                i = void 0;
                for (i in pairs) {
                  i = i;
                  if ((pairs[i] === '') || (typeof pairs[i] === 'function')) {
                    continue;
                  }
                  pair = pairs[i].split('=');
                  obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                }
              }
              return obj;
            },
            validateUser: function(opts) {
              var clientId, configName, expiry, location_parse, params, search, token, uid, url;
              if (opts == null) {
                opts = {};
              }
              configName = opts.config;
              if (this.dfd == null) {
                this.initDfd();
                if (this.userIsAuthenticated()) {
                  this.resolveDfd();
                } else {
                  search = $location.search();
                  location_parse = this.parseLocation(window.location.search);
                  params = Object.keys(search).length === 0 ? location_parse : search;
                  token = params.auth_token || params.token;
                  if (token !== void 0) {
                    clientId = params.client_id;
                    uid = params.uid;
                    expiry = params.expiry;
                    configName = params.config;
                    this.setConfigName(configName);
                    this.mustResetPassword = params.reset_password;
                    this.firstTimeLogin = params.account_confirmation_success;
                    this.oauthRegistration = params.oauth_registration;
                    this.setAuthHeaders(this.buildAuthHeaders({
                      token: token,
                      clientId: clientId,
                      uid: uid,
                      expiry: expiry
                    }));
                    url = $location.path() || '/';
                    ['auth_token', 'token', 'client_id', 'uid', 'expiry', 'config', 'reset_password', 'account_confirmation_success', 'oauth_registration'].forEach(function(prop) {
                      return delete params[prop];
                    });
                    if (Object.keys(params).length > 0) {
                      url += '?' + this.buildQueryString(params);
                    }
                    $location.url(url);
                  } else if (this.retrieveData('currentConfigName')) {
                    configName = this.retrieveData('currentConfigName');
                  }
                  if (this.getConfig().forceValidateToken) {
                    this.validateToken({
                      config: configName
                    });
                  } else if (!isEmpty(this.retrieveData('auth_headers'))) {
                    if (this.tokenHasExpired()) {
                      $rootScope.$broadcast('auth:session-expired');
                      this.rejectDfd({
                        reason: 'unauthorized',
                        errors: ['Session expired.']
                      });
                    } else {
                      this.validateToken({
                        config: configName
                      });
                    }
                  } else {
                    this.rejectDfd({
                      reason: 'unauthorized',
                      errors: ['No credentials']
                    });
                    $rootScope.$broadcast('auth:invalid');
                  }
                }
              }
              return this.dfd.promise;
            },
            validateToken: function(opts) {
              if (opts == null) {
                opts = {};
              }
              if (!this.tokenHasExpired()) {
                return $http.get(this.apiUrl(opts.config) + this.getConfig(opts.config).tokenValidationPath).success((function(_this) {
                  return function(resp) {
                    var authData;
                    authData = _this.getConfig(opts.config).handleTokenValidationResponse(resp);
                    _this.handleValidAuth(authData);
                    if (_this.firstTimeLogin) {
                      $rootScope.$broadcast('auth:email-confirmation-success', _this.user);
                    }
                    if (_this.oauthRegistration) {
                      $rootScope.$broadcast('auth:oauth-registration', _this.user);
                    }
                    if (_this.mustResetPassword) {
                      $rootScope.$broadcast('auth:password-reset-confirm-success', _this.user);
                    }
                    return $rootScope.$broadcast('auth:validation-success', _this.user);
                  };
                })(this)).error((function(_this) {
                  return function(data) {
                    if (_this.firstTimeLogin) {
                      $rootScope.$broadcast('auth:email-confirmation-error', data);
                    }
                    if (_this.mustResetPassword) {
                      $rootScope.$broadcast('auth:password-reset-confirm-error', data);
                    }
                    $rootScope.$broadcast('auth:validation-error', data);
                    return _this.rejectDfd({
                      reason: 'unauthorized',
                      errors: data != null ? data.errors : ['Unspecified error']
                    });
                  };
                })(this));
              } else {
                return this.rejectDfd({
                  reason: 'unauthorized',
                  errors: ['Expired credentials']
                });
              }
            },
            tokenHasExpired: function() {
              var expiry, now;
              expiry = this.getExpiry();
              now = new Date().getTime();
              return expiry && expiry < now;
            },
            getExpiry: function() {
              return this.getConfig().parseExpiry(this.retrieveData('auth_headers') || {});
            },
            invalidateTokens: function() {
              var key, ref, val;
              ref = this.user;
              for (key in ref) {
                val = ref[key];
                delete this.user[key];
              }
              this.deleteData('currentConfigName');
              if (this.timer != null) {
                $interval.cancel(this.timer);
              }
              return this.deleteData('auth_headers');
            },
            signOut: function() {
              return $http.get(this.apiUrl() + this.getConfig().signOutUrl).success((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:logout-success');
                };
              })(this)).error((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:logout-error', resp);
                };
              })(this));
            },
            handleValidAuth: function(user, setHeader) {
              if (setHeader == null) {
                setHeader = false;
              }
              if (this.requestCredentialsPollingTimer != null) {
                $timeout.cancel(this.requestCredentialsPollingTimer);
              }
              this.cancelOmniauthInAppBrowserListeners();
              angular.extend(this.user, user);
              this.user.signedIn = true;
              this.user.configName = this.getCurrentConfigName();
              if (setHeader) {
                this.setAuthHeaders(this.buildAuthHeaders({
                  token: this.user.auth_token,
                  clientId: this.user.client_id,
                  uid: this.user.uid,
                  expiry: this.user.expiry
                }));
              }
              return this.resolveDfd();
            },
            buildAuthHeaders: function(ctx) {
              var headers, key, ref, val;
              headers = {};
              ref = this.getConfig().tokenFormat;
              for (key in ref) {
                val = ref[key];
                headers[key] = $interpolate(val)(ctx);
              }
              return headers;
            },
            persistData: function(key, val, configName) {
              if (this.getConfig(configName).storage instanceof Object) {
                return this.getConfig(configName).storage.persistData(key, val, this.getConfig(configName));
              } else {
                switch (this.getConfig(configName).storage) {
                  case 'localStorage':
                    return $window.localStorage.setItem(key, JSON.stringify(val));
                  case 'sessionStorage':
                    return $window.sessionStorage.setItem(key, JSON.stringify(val));
                  default:
                    return ipCookie(key, val, this.getConfig().cookieOps);
                }
              }
            },
            retrieveData: function(key) {
              var e;
              try {
                if (this.getConfig().storage instanceof Object) {
                  return this.getConfig().storage.retrieveData(key);
                } else {
                  switch (this.getConfig().storage) {
                    case 'localStorage':
                      return JSON.parse($window.localStorage.getItem(key));
                    case 'sessionStorage':
                      return JSON.parse($window.sessionStorage.getItem(key));
                    default:
                      return ipCookie(key);
                  }
                }
              } catch (error1) {
                e = error1;
                if (e instanceof SyntaxError) {
                  return void 0;
                } else {
                  throw e;
                }
              }
            },
            deleteData: function(key) {
              if (this.getConfig().storage instanceof Object) {
                this.getConfig().storage.deleteData(key);
              }
              switch (this.getConfig().storage) {
                case 'localStorage':
                  return $window.localStorage.removeItem(key);
                case 'sessionStorage':
                  return $window.sessionStorage.removeItem(key);
                default:
                  return ipCookie.remove(key, {
                    path: this.getConfig().cookieOps.path
                  });
              }
            },
            setAuthHeaders: function(h) {
              var expiry, newHeaders, now, result;
              newHeaders = angular.extend(this.retrieveData('auth_headers') || {}, h);
              result = this.persistData('auth_headers', newHeaders);
              expiry = this.getExpiry();
              now = new Date().getTime();
              if (expiry > now) {
                if (this.timer != null) {
                  $interval.cancel(this.timer);
                }
                this.timer = $interval(((function(_this) {
                  return function() {
                    return _this.validateUser({
                      config: _this.getSavedConfig()
                    });
                  };
                })(this)), parseInt(expiry - now), 1);
              }
              return result;
            },
            initDfd: function() {
              return this.dfd = $q.defer();
            },
            rejectDfd: function(reason) {
              this.invalidateTokens();
              if (this.dfd != null) {
                this.dfd.reject(reason);
                return $timeout(((function(_this) {
                  return function() {
                    return _this.dfd = null;
                  };
                })(this)), 0);
              }
            },
            apiUrl: function(configName) {
              if (this.getConfig(configName).proxyIf()) {
                return this.getConfig(configName).proxyUrl;
              } else {
                return this.getConfig(configName).apiUrl;
              }
            },
            getConfig: function(name) {
              return configs[this.getCurrentConfigName(name)];
            },
            getResultOrValue: function(arg) {
              if (typeof arg === 'function') {
                return arg();
              } else {
                return arg;
              }
            },
            getCurrentConfigName: function(name) {
              return name || this.getSavedConfig();
            },
            getSavedConfig: function() {
              var c, key;
              c = void 0;
              key = 'currentConfigName';
              if (this.hasLocalStorage()) {
                if (c == null) {
                  c = JSON.parse($window.localStorage.getItem(key));
                }
              } else if (this.hasSessionStorage()) {
                if (c == null) {
                  c = JSON.parse($window.sessionStorage.getItem(key));
                }
              }
              if (c == null) {
                c = ipCookie(key);
              }
              return c || defaultConfigName;
            },
            hasSessionStorage: function() {
              var error;
              if (this._hasSessionStorage == null) {
                this._hasSessionStorage = false;
                try {
                  $window.sessionStorage.setItem('ng-token-auth-test', 'ng-token-auth-test');
                  $window.sessionStorage.removeItem('ng-token-auth-test');
                  this._hasSessionStorage = true;
                } catch (error1) {
                  error = error1;
                }
              }
              return this._hasSessionStorage;
            },
            hasLocalStorage: function() {
              var error;
              if (this._hasLocalStorage == null) {
                this._hasLocalStorage = false;
                try {
                  $window.localStorage.setItem('ng-token-auth-test', 'ng-token-auth-test');
                  $window.localStorage.removeItem('ng-token-auth-test');
                  this._hasLocalStorage = true;
                } catch (error1) {
                  error = error1;
                }
              }
              return this._hasLocalStorage;
            }
          };
        };
      })(this)
    ]
  };
}).config([
  '$httpProvider', function($httpProvider) {
    var httpMethods, tokenIsCurrent, updateHeadersFromResponse;
    tokenIsCurrent = function($auth, headers) {
      var newTokenExpiry, oldTokenExpiry;
      oldTokenExpiry = Number($auth.getExpiry());
      newTokenExpiry = Number($auth.getConfig().parseExpiry(headers || {}));
      return newTokenExpiry >= oldTokenExpiry;
    };
    updateHeadersFromResponse = function($auth, resp) {
      var key, newHeaders, ref, val;
      newHeaders = {};
      ref = $auth.getConfig().tokenFormat;
      for (key in ref) {
        val = ref[key];
        if (resp.headers(key)) {
          newHeaders[key] = resp.headers(key);
        }
      }
      if (tokenIsCurrent($auth, newHeaders)) {
        return $auth.setAuthHeaders(newHeaders);
      }
    };
    $httpProvider.interceptors.push([
      '$injector', function($injector) {
        return {
          request: function(req) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                var key, ref, results, val;
                if (req.url.match($auth.apiUrl())) {
                  ref = $auth.retrieveData('auth_headers');
                  results = [];
                  for (key in ref) {
                    val = ref[key];
                    results.push(req.headers[key] = val);
                  }
                  return results;
                }
              }
            ]);
            return req;
          },
          response: function(resp) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                if (resp.config.url.match($auth.apiUrl())) {
                  return updateHeadersFromResponse($auth, resp);
                }
              }
            ]);
            return resp;
          },
          responseError: function(resp) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                if (resp.config.url.match($auth.apiUrl())) {
                  return updateHeadersFromResponse($auth, resp);
                }
              }
            ]);
            return $injector.get('$q').reject(resp);
          }
        };
      }
    ]);
    httpMethods = ['get', 'post', 'put', 'patch', 'delete'];
    return angular.forEach(httpMethods, function(method) {
      var base;
      if ((base = $httpProvider.defaults.headers)[method] == null) {
        base[method] = {};
      }
      return $httpProvider.defaults.headers[method]['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    });
  }
]).run([
  '$auth', '$window', '$rootScope', function($auth, $window, $rootScope) {
    return $auth.initialize();
  }
]);

window.isOldIE = function() {
  var nav, out, version;
  out = false;
  nav = navigator.userAgent.toLowerCase();
  if (nav && nav.indexOf('msie') !== -1) {
    version = parseInt(nav.split('msie')[1]);
    if (version < 10) {
      out = true;
    }
  }
  return out;
};

window.isIE = function() {
  var nav;
  nav = navigator.userAgent.toLowerCase();
  return (nav && nav.indexOf('msie') !== -1) || !!navigator.userAgent.match(/Trident.*rv\:11\./);
};

window.isEmpty = function(obj) {
  var key, val;
  if (!obj) {
    return true;
  }
  if (obj.length > 0) {
    return false;
  }
  if (obj.length === 0) {
    return true;
  }
  for (key in obj) {
    val = obj[key];
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};

angular.module('pickapp').service('Auth', function($rootScope, $log, $ionicModal, $ionicAuth, $ionicPopup, $ionicPush, $ionicUser, $auth, api_base, $q, $http, $filter, $ionicLoading, User, Notification) {
  var fakeLogin, finallyRegisterPush, getNotifications, getUserDetails, parseUserData, pushRegister, pushUnregister, registerPushNotifications, user_has_photo;
  fakeLogin = function() {
    return setTimeout(function() {
      var loginForm;
      loginForm = {
        email: 'macchie.raldo@koodit.it',
        password: 'password'
      };
      return $auth.submitLogin(loginForm);
    }, 1500);
  };
  user_has_photo = function() {};
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
  finallyRegisterPush = function() {
    $log.debug("FINALLY REG PUSH");
    $ionicPush.register().then(function(t) {
      return $ionicPush.saveToken(t);
    }).then(function(t) {
      $log.debug('Token saved:', t.token);
      $ionicPush.saveToken(t);
      $ionicUser.save();
      return User.updateDeviceTokens(t.token, $rootScope.user.id).then(function(resp) {
        return $log.debug(resp);
      });
    });
    return $rootScope.$on('cloud:push:notification', function(event, data) {
      var msg;
      msg = data.message;
      return $log.debug(msg.title + ": " + msg.text);
    });
  };
  pushRegister = function() {
    var ionic_user;
    $log.debug("PUSH REG");
    ionic_user = {
      email: 'pick_user_' + $rootScope.user.id + '@pickapp.it',
      password: md5($rootScope.user.id)
    };
    return $ionicAuth.login('basic', ionic_user).then(function() {
      return finallyRegisterPush();
    }, function(err) {
      return $ionicAuth.signup(ionic_user).then(function() {
        return $ionicAuth.login('basic', ionic_user).then(function() {
          return finallyRegisterPush();
        });
      }, function(err) {
        return $log.debug(err);
      });
    });
  };
  pushUnregister = function() {
    return User.clearDeviceTokens($rootScope.user.id).then(function(resp) {
      $ionicAuth.logout();
      return $auth.signOut();
    }, function(error) {
      $ionicAuth.logout();
      return $auth.signOut();
    });
  };
  registerPushNotifications = function() {
    $log.debug("User.registerPushNotifications");
    $ionicPush.register({
      ignore_user: true
    }).then(function(t) {
      $log.debug("$ionicPush.register", t);
      $log.debug("$ionicPush.saveToken", t);
      return User.updateDeviceTokens(t.token, $rootScope.user.football_user_id).then(function(resp) {
        return $log.debug(resp);
      });
    }).then(function(t) {});
    return $rootScope.$on('cloud:push:notification', function(event, data) {
      return $log.debug(data.message);
    });
  };
  parseUserData = function() {
    $rootScope.auth_modal.hide();
    registerPushNotifications();
    User.getActiveTeams().then(function(resp) {
      $log.debug("User.getActiveTeams", resp.data);
      return $rootScope.user.teams = resp.data;
    });
    return User.getFeed(10).then(function(resp) {
      $log.debug("User.getFeed", resp.data);
      return $rootScope.user.feed = resp.data;
    });
  };
  this.init = function() {
    $ionicModal.fromTemplateUrl('templates/auth_modal.html', {
      scope: $rootScope,
      backdropClickToClose: false,
      hardwareBackButtonClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $rootScope.auth_modal = modal;
      $rootScope.$on('auth:login-success', function(resp) {
        $ionicLoading.hide();
        $rootScope.auth_modal.hide();
        $rootScope.loginForm = {};
        $rootScope.registrationForm = {};
				User.updateDeviceTokens($rootScope.oneSignalIds.userId, $rootScope.user.id)
				/*.then(function(data) {
					alert("OK: " + JSON.stringify(data));
				}, function(err) {
					alert("Error: " + JSON.stringify(err));
				});*/
        user_has_photo();
        getNotifications();
        getUserDetails();
        return pushRegister();
      });
      $rootScope.$on('auth:login-error', function(error) {
        var alertPopup;
        $log.debug('auth:login-error', error);
        $ionicLoading.hide();
        return alertPopup = $ionicPopup.alert({
          title: 'Credenziali Errate',
          template: 'Non è stato possibile effettuare il login, verifica le credenziali.'
        });
      });
      $rootScope.$on('auth:logout-success', function() {
        $log.debug('auth:logout-success');
        return $rootScope.auth_modal.show();
      });
      $rootScope.$on('auth:validation-success', function() {
        $log.debug('auth:validation-success', $rootScope.user);
        $rootScope.auth_modal.hide();
        user_has_photo();
        getNotifications();
        getUserDetails();
        return pushRegister();
      });
      $rootScope.$on('auth:validation-error', function() {
        $rootScope.auth_modal.show();
        return pushUnregister();
      });
      $rootScope.$on('auth:session-expired', function() {});
      $rootScope.$on('auth:registration-email-success', function() {});
      return $auth.validateUser().then(function(resp) {
        $log.debug('auth:validation-success', $rootScope.user);
        $rootScope.auth_modal.hide();
        user_has_photo();
        getNotifications();
        getUserDetails();
        return pushRegister();
      })["catch"](function(err) {
        $rootScope.auth_modal.show();
        if (window.location.protocol === 'http:' && window.location.host !== "localhost:8080") {
          return fakeLogin();
        }
      });
    });
    return this.askForLogout = function() {
      var confirmPopup;
      confirmPopup = $ionicPopup.confirm({
        title: 'Logout',
        template: 'Vuoi effettuare il logout?',
        cancelText: 'No',
        okText: 'Sì'
      });
      return confirmPopup.then(function(res) {
        if (res) {
          return pushUnregister();
        }
      });
    };
  };
  return this;
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
    }, function(error) {
      return deferred.reject(error);
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
    data.travel_id = travel_id;
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

angular.module('pickapp').service('Profile', function($q, $http, $rootScope, $ionicModal, api_base) {
  var urlBase;
  urlBase = api_base + '/users/';
  this.showProfileDialog = function(id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + id + "/profile",
      method: 'GET'
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
  this.searchRooms = function(search_term) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + '/search_rooms',
      method: 'GET',
      params: {
        q: search_term
      }
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

angular.module('pickapp').service('TravelReview', function($q, $http, $rootScope, api_base) {
  var urlBase;
  urlBase = api_base + '/users';
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

angular.module('pickapp').service('User', function($q, $http, $rootScope, api_base, auth_base) {
  var urlBase;
  urlBase = api_base + '/users/';
  this.checkForAvailableEmail = function(email) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: api_base + '/check_for_available_email',
      method: 'GET',
      params: {
        email: email
      }
    }).then(function(data) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.updateDeviceTokens = function(token, user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/update_device_tokens',
      method: 'POST',
      data: {
				user: $rootScope.user,
        device_token: token
      }
    }).then(function(data) {
      return deferred.resolve(data);
    }, function(error) {
      return deferred.reject(error);
		});
    return deferred.promise;
  };
  this.clearDeviceTokens = function(user_id) {
    var deferred;
    deferred = $q.defer();
    $http({
      url: urlBase + user_id + '/clear_device_tokens',
      method: 'POST'
    }).then(function(data) {
      return deferred.resolve(data);
    }, function(error) {
      return deferred.reject(error);
    });
    return deferred.promise;
  };
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
