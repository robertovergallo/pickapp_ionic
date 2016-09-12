angular.module('pickapp').controller 'HomeController', ($scope, $rootScope, $interval, $http, $auth, $filter, Notification, User) ->

	$scope.display_text =
		driver_payoff: "Offri i tuoi posti liberi in auto ad altri utenti di PickApp per tutti i tuoi viaggi nelle Vrooms. Viaggia in compagnia in completa sicurezza!"
		passenger_payoff: "Scegli tra le Vrooms la tua destinazione preferita e cerca un passaggio: è semplice, affidabile e divertente."
		pickapp_payoff: "Noi controlliamo la veridicità di patente e assicurazione dei guidatori, tu puoi recensire gli utenti affidabili e segnalare se qualcuno non rispetta le regole. Il carpooling non è mai stato così sicuro!"


	$scope.pullUpdate = ->
		getNotifications()
		getUserDetails()
		$scope.$broadcast('scroll.refreshComplete');

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