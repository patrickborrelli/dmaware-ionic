angular.module('dmaware', ['ionic', 'dmaware.controllers', 'dmaware.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/sidebar.html',
        controller: 'AppCtrl'
    })

    .state('app.intro', {
        url: '/intro',
        views: {
            'mainContent': {
                templateUrl: 'templates/intro.html',
                controller: 'AppCtrl'
            }
        }
    })
      
    .state('app.race', {
        url: '/race',
        views: {
            'mainContent': {
                templateUrl: 'templates/race.html',
                controller: 'HomeController'
            }
        }
    })
    
    .state('app.class', {
        url: '/class',
        views: {
            'mainContent': {
                templateUrl: 'templates/class.html',
                controller: 'HomeController'
            }
        }
    })
    
    .state('app.alignment', {
        url: '/alignment',
        views: {
            'mainContent': {
                templateUrl: 'templates/alignment.html',
                controller: 'HomeController'
            }
        }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/intro');
});
