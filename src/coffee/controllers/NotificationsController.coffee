angular.module('pickapp').controller 'NotificationsController', ($scope, $state, $rootScope, $filter,  Notification) ->

	# Sections Methods

	$scope.active_section = 0

	$scope.setActiveSection = (id) ->
		$scope.active_section = id


	$scope.display_all_notifications = false

	$scope.toggleAllNotifications = ->
		$scope.display_all_notifications = !$scope.display_all_notifications

	$scope.pullUpdate = ->
		getNotifications()
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

	getNotifications()

	# Notifications Methods

	$scope.setNotificationAsClicked = (notification_id) ->
		Notification.setNotificationClicked($rootScope.user.id, notification_id).then( (resp) ->
			getNotifications()
		)


	$scope.convertUrl = (notification) ->
		if notification
			if notification.link
				url = notification.link
				console.log url
				url = url.replace('#/', '')
				splitted_url = url.split('/')

				# 4 travel offers & requests

				if splitted_url[0] == "rooms"
					room_id = parseInt(splitted_url[1])

					if splitted_url[2] == "travels"
						travel_offer_id = parseInt(splitted_url[3])

						if notification.is_message
							if notification.title == "Hai ricevuto un messaggio pubblico!"
								$state.go('app.room_offer', {room_id: room_id, travel_id: travel_offer_id, open_public_chat: 'true'})
							else
								$state.go('app.room_offer', {room_id: room_id, travel_id: travel_offer_id, open_private_chat: parseInt(splitted_url[5]) })
						else
							$state.go('app.room_offer', {room_id: room_id, travel_id: travel_offer_id})

					if splitted_url[2] == "travel_requests"
						travel_offer_id = parseInt(splitted_url[3])
						$state.go('app.room_request', {room_id: room_id, travel_id: travel_offer_id})

				# 4 profile

				if splitted_url[0] == "profile"
					if splitted_url[1] == "travels"
						travel_id = parseInt(splitted_url[2])
						$state.go('app.profile_travel', {travel_id: travel_id})
			else
				if (notification.title == "Aggiungi un'auto!" || notification.title == "Sei diventato un driver!")
					$state.go('app.cars')
