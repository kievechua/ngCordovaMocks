/**
 * Copyright (c) 2014 Ecofic LLC. All rights reserved.
 * http://www.ecofic.com

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/**
 * @ngdoc service
 * @name ngCordovaMocks.cordovaGeolocation
 *
 * @description
 * A service for testing location services
 * in an app build with ngCordova.
 */ 
ngCordovaMocks.factory('$cordovaGeolocation', ['$interval', '$q', function($interval, $q) {
	var throwsError = false;
	var watchIntervals = [];
	var locations = [];
	var currentPosition = null;
	var nextPosition = null;

	return {
        /**
		 * @ngdoc property
		 * @name throwsError
		 * @propertyOf ngCordovaMocks.cordovaGeolocation
		 *
		 * @description
		 * A flag that signals whether a promise should be
		 * rejected or not. It is intended for testing purposes only.
		**/
		throwsError: throwsError,

        /**
		 * @ngdoc property
		 * @name watchIntervals
		 * @propertyOf ngCordovaMocks.cordovaGeolocation
		 *
		 * @description
		 * The collection of watchers that are currently active.
		 * It is intended for testing purposes only.
		**/		
		watchIntervals: watchIntervals,

        /**
		 * @ngdoc property
		 * @name locations
		 * @propertyOf ngCordovaMocks.cordovaGeolocation
		 *
		 * @description
		 * The collection of 'locations' that have been logged.
		 * It is intended for testing purposes only.
		**/				
		locations: locations,

        /**
		 * @ngdoc property
		 * @name currentPosition
		 * @propertyOf ngCordovaMocks.cordovaGeolocation
		 *
		 * @description
		 * The last location logged.
		 * It is intended for testing purposes only.
		**/						
		currentPosition: currentPosition,

        /**
		 * @ngdoc property
		 * @name nextPosition
		 * @propertyOf ngCordovaMocks.cordovaGeolocation
		 *
		 * @description
		 * The position to be logged the next time that a watcher
		 * gets the location.
		 * It is intended for testing purposes only.
		**/						
		nextPosition: nextPosition,

		getCurrentPosition: function(options) {
			var defer = $q.defer();
			if (this.throwsError) {
				defer.reject('There was an error getting the location.');
			} else {
				if (options) {
					options = options;	// This is just to get by JSHint.
				}
				defer.resolve(this.currentPosition);
			}
			return defer.promise;
		},

		watchPosition: function(options) {
			var defer = $q.defer();
			var watchId = Math.floor((Math.random() * 1000000) + 1);

			this.locations = [];
			self = this;

			if (this.throwsError) {
				defer.reject('There was an error getting the geolocation.');
			} else {
				var delay = 1000;
				if (options && options.timeout) {
					delay = options.timeout;
				}				

				this.watchIntervals.push({
					watchId: watchId,
					interval: $interval(
						function() {
							if (self.throwsError) {
								defer.reject('There was an error watching the geolocation.');
							}

							// Attempt to use nextPosition. If one isn't set,
							// generate a random location for testing purposes.
							var result = self.nextPosition;
							if (result === null) {
								// Generate a random position
								var altitude = ((Math.random() * 100) + 1);
								var latitude = ((Math.random() * 180) + 1) - 90;
								var longitude = ((Math.random() * 360) + 1) - 180;

								var accuracy = ((Math.random() * 10) + 1);
								var altitudeAccuracy = ((Math.random() * 10) + 1);
								var heading = ((Math.random() * 360) + 1);
								var speed = ((Math.random() * 100) + 1);

								result = { 
									coords: {
										latitude: latitude,
										longitude: longitude,
										altitude: altitude,
										accuracy: accuracy,
										altitudeAccuracy: altitudeAccuracy,
										heading: heading,
										speed: speed
									}, 
									timestamp:Date.now() 
								};
							}

							self.currentPosition = result;
							self.locations.push(result);
							defer.notify(result);	
						}, 
						delay
					)
				});
			}

			return {
				watchId: watchId,
				promise: defer.promise
			};						
		},

		clearWatch: function (watchId) {
			var defer = $q.defer();			
			if (watchId) {
				if (this.throwsError) {
					defer.reject('Unable to clear watch.');
				} else {
					var removed = -1;
					for (var i=0; i<this.watchIntervals.length; i++) {
						if (this.watchIntervals[i].watchId === watchId) {
							$interval.cancel(watchIntervals[i].interval);
							removed = i;
							break;
						}
					}

					if (removed !== -1) {
						this.watchIntervals.splice(removed, 1);
					}
				}
			} else {
				defer.reject('Unable to clear watch. No watch ID provided.');
			}
			return defer.promise;
		}		
	};
}]);