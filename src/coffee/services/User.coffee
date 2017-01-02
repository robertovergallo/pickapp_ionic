angular.module('pickapp').service('User', ($q, $http, $rootScope, api_base, auth_base)->
  urlBase = api_base + '/users/'

  this.checkForAvailableEmail = (email)->
    deferred = $q.defer()
    $http({
      url: api_base + '/check_for_available_email',
      method: 'GET'
      params: {
        email: email
      }
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.updateDeviceTokens = (token, user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/update_device_tokens',
      method: 'POST',
      data: {
        device_token: token
      }
    })
    .then (data)->
      deferred.resolve(data)

    deferred.promise

  this.clearDeviceTokens = (user_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/clear_device_tokens',
      method: 'POST',
    })
    .then (data)->
      deferred.resolve(data)
    , (error)->
      deferred.reject(error)

    deferred.promise

  this.signUserForSchool = (user_id, school_code) ->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/sign_for_school/' + school_code,
      method: 'POST'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelReviewsAsAuthor = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/travel_reviews/as_author',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelReviewsAsTarget = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/travel_reviews/as_target',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getLatestReviewsAsTarget = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/travel_reviews/as_target/latest',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.setUserImage = (id, image)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/set_profile_image',
      method: 'POST',
      data: image
    })
    .then (data)->
      deferred.resolve(data)
    # .error (data)->
    #   console.log data

    deferred.promise

  this.fetchUserInfo = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getPreferredRooms = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/preferred_rooms',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelsCount = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/travels_count',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getReviewsCount = (id)->
    deferred = $q.defer()
    $http({
      url: urlBase + id + '/reviews_count',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.pendingDriverVerificationCount = ()->
    deferred = $q.defer()
    $http({
      url: urlBase + 'pending_driver_verification_count',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelsAsDriver = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels_as_driver',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelsAsApplied = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels_as_applied',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelsAsApproved = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels_as_approved',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelsAsPassenger = (user_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels_as_passenger',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getTravelForUser = (user_id, travel_id)->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels/' + travel_id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.markTravelAsCompleted = (user_id, travel_id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + user_id + '/travels/' + travel_id + '/mark_as_completed',
      method: 'POST'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getPendingDrivers = ->
    deferred = $q.defer()
    $http({
      url: urlBase + 'pending_drivers',
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.getPendingDriver = (id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + 'pending_drivers/' + id,
      method: 'GET'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this.authPendingDriver = (id) ->
    deferred = $q.defer()
    $http({
      url: urlBase + 'pending_drivers/auth/' + id,
      method: 'POST'
    })
    .then (data)->
      deferred.resolve(data)
    #.error (data)->

    deferred.promise

  this
)
