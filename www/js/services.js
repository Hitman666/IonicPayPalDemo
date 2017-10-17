angular.module('starter.services', [])

	.factory('Chats', function() {
		// Might use a resource here that returns a JSON array

		// Some fake testing data
		var chats = [{
			id: 0,
			name: 'Ben Sparrow',
			lastText: 'You on your way?',
			face: 'img/ben.png'
		}, {
			id: 1,
			name: 'Max Lynx',
			lastText: 'Hey, it\'s me',
			face: 'img/max.png'
		}, {
			id: 2,
			name: 'Adam Bradleyson',
			lastText: 'I should buy a boat',
			face: 'img/adam.jpg'
		}, {
			id: 3,
			name: 'Perry Governor',
			lastText: 'Look at my mukluks!',
			face: 'img/perry.png'
		}, {
			id: 4,
			name: 'Mike Harrington',
			lastText: 'This is wicked good ice cream.',
			face: 'img/mike.png'
		}];

		return {
			all: function() {
				return chats;
			},
			remove: function(chat) {
				chats.splice(chats.indexOf(chat), 1);
			},
			get: function(chatId) {
				for (var i = 0; i < chats.length; i++) {
					if (chats[i].id === parseInt(chatId)) {
						return chats[i];
					}
				}
				return null;
			}
		};
	})

	.factory('PaypalFactory', ['$q', '$filter', '$timeout', '$ionicPlatform', 'APP_CONSTS', function($q, $filter, $timeout, $ionicPlatform, APP_CONSTS) {
		var init_defer;

		var that = {};

		/**
		* @ngdoc method
		* @name initPaymentUI
		* @methodOf app.PaypalFactory
		* @description
		* Inits the payapl ui with certain envs.
		* 
		* @returns {object} Promise paypal ui init done
		*/
		that.initPaymentUI = function() {
			init_defer = $q.defer();
			$ionicPlatform.ready().then(function() {

				var clientIDs = {
					"PayPalEnvironmentProduction": APP_CONSTS.payPalProductionId,
					"PayPalEnvironmentSandbox": APP_CONSTS.payPalSandboxId
				};
				PayPalMobile.init(clientIDs, that.onPayPalMobileInit);
			});

			return init_defer.promise;
		}

		/**
		* @ngdoc method
		* @name createPayment
		* @methodOf app.PaypalFactory
		* @param {string|number} total total sum. Pattern 12.23
		* @param {string} name name of the item in paypal
		* @description
		* Creates a paypal payment object 
		*
		* @returns {object} PayPalPaymentObject
		*/
		var createPayment = function(total, name) {
			// "Sale  == >  immediate payment
			// "Auth" for payment authorization only, to be captured separately at a later time.
			// "Order" for taking an order, with authorization and capture to be done separately at a later time.
			var payment = new PayPalPayment("" + total, "USD", "" + name, "Sale");
			return payment;
		}

		/**
		* @ngdoc method
		* @name configuration
		* @methodOf app.PaypalFactory
		* @description
		* Helper to create a paypal configuration object
		*
		* 
		* @returns {object} PayPal configuration
		*/
		var configuration = function() {
			// for more options see `paypal-mobile-js-helper.js`
			var config = new PayPalConfiguration({ merchantName: APP_CONSTS.payPalShopName, merchantPrivacyPolicyURL: APP_CONSTS.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: APP_CONSTS.payPalMerchantUserAgreementURL });
			return config;
		}

		that.onPayPalMobileInit = function() {
			$ionicPlatform.ready().then(function() {
				PayPalMobile.prepareToRender(APP_CONSTS.payPalEnv, configuration(), function() {
					$timeout(function() {
						init_defer.resolve();
					});
				});
			});
		}

		/**
		* @ngdoc method
		* @name makePayment
		* @methodOf app.PaypalFactory
		* @param {string|number} total total sum. Pattern 12.23
		* @param {string} name name of the item in paypal
		* @description
		* Performs a paypal single payment 
		*
		* 
		* @returns {object} Promise gets resolved on successful payment, rejected on error 
		*/
		that.makePayment = function(total, name) {
			var defer = $q.defer();
			total = $filter('number')(total, 2);
			$ionicPlatform.ready().then(function() {
				PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function(result) {
					$timeout(function() {
						defer.resolve(result);
					});
				}, function(error) {
					$timeout(function() {
						defer.reject(error);
					});
				});
			});

			return defer.promise;
		}

		/**
		* @ngdoc method
		* @name makeFuturePayment
		* @methodOf app.PaypalFactory
		* @description
		* Performs a paypal future payment 
		* 
		* @returns {object} Promise gets resolved on successful payment, rejected on error 
		*/
		that.makeFuturePayment = function(total, name) {
			var defer = $q.defer();
			$ionicPlatform.ready().then(function() {
				PayPalMobile.renderFuturePaymentUI(
					function(authorization) {
						defer.resolve(authorization);
					},
					function(cancelReason) {
						defer.reject(cancelReason);
					});
			});

			return defer.promise;
		}

		return that;
	}]);