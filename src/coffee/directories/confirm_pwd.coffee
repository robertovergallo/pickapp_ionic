angular.module('pickapp').directive 'confirmPwd', ($interpolate, $parse) ->
  {
    require: 'ngModel'
    link: (scope, elem, attr, ngModelCtrl) ->
      pwdToMatch = $parse(attr.confirmPwd)
      pwdFn = $interpolate(attr.confirmPwd)(scope)
      scope.$watch pwdFn, (newVal) ->
        ngModelCtrl.$setValidity 'password', ngModelCtrl.$viewValue == newVal

      ngModelCtrl.$validators.password = (modelValue, viewValue) ->
        value = modelValue or viewValue
        value == pwdToMatch(scope)

  }