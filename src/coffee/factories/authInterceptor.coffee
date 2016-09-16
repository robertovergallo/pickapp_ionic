angular.module('pickapp').factory 'authInterceptor', ($injector) ->
  authInterceptor = request: (config) ->
    $injector.invoke ($http, $auth) ->
      $http.defaults.headers.common = $auth.retrieveData('auth_headers') if window.location.protocol == 'http:'
      #console.log $auth.retrieveData('auth_headers')
      # if config.url.match($auth.apiUrl())
      #   headers = $auth.retrieveData('auth_headers')
      #   # for property of headers
      #   #   #'property = property'
      #   #   if headers.hasOwnProperty(property)
      #   #     config.headers[property] = headers[property]
      #   config.headers.common = headers

    #config.headers['header_estatico'] = 'valor'
    #console.log config.headers
    config
    
  authInterceptor