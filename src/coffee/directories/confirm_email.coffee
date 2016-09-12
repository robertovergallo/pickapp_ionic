angular.module('pickapp').directive 'confirmEmail', ($interpolate, $parse, User) ->
  {
    require: 'ngModel'
    link: (scope, elem, attr, ngModelCtrl) ->
      email = $parse(attr.confirmEmail)
      emailFn = $interpolate(attr.confirmEmail)(scope)

      scope.$watch emailFn, (newVal) ->
        User.checkForAvailableEmail(newVal).then (resp) ->
          ngModelCtrl.$setValidity 'email', resp.data.available
        
      ngModelCtrl.$validators.email = (modelValue, viewValue) ->
        true
  }