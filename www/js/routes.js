angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
    $stateProvider

      .state('signup', {
            url: '/signup',
            templateUrl: 'templates/signup.html',
            controller: 'signupCtrl'
      })

      .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'mainCtrl'
        })

      .state('page', {
          url: '/page1',
          templateUrl: 'templates/page.html',
          controller: 'pageCtrl'
      })

      .state('edit', {
          url: '/edit/:id',
          params:{
              id: null
          },
          templateUrl: 'templates/edit.html',
          controller: 'editCtrl'
      })

      .state('tabsController.tab1', {
          url: '/placed',
          views: {
              'tab1': {
                  templateUrl: 'templates/tab1.html',
                  controller: 'placedCtrl'
              }
          }
      })

      .state('tabsController.tab2', {
          url: '/accepted',
          views: {
              'tab2': {
                  templateUrl: 'templates/tab2.html',
                  controller: 'acceptedCtrl'
              }
          }
      })

      .state('tabsController.tab3', {
          url: '/open',
          views: {
              'tab3': {
                  templateUrl: 'templates/tab3.html',
                  controller: 'openCtrl'
              }
          }
      })

      .state('tabsController.tab4', {
          url: '/closed',
          views: {
              'tab4': {
                  templateUrl: 'templates/tab4.html',
                  controller: 'closedCtrl'
              }
          }
      })

      .state('createController.client', {
          url: "/client",
          views: {
              'client': {
                  templateUrl: "templates/createClient.html"

              }
          }
      })

      .state('createController.date', {
          url: "/date",
          views: {
              'date': {
                  templateUrl: "templates/createDate.html"

              }
          }
      })

      .state('createController.equipment', {
          url: "/equipment",
          views: {
              'equipment': {
                  templateUrl: "templates/createEquipment.html"

              }
          }
      })

      .state('createController.check', {
          url: "/check",
          views: {
              'check': {
                  templateUrl: "templates/createCheck.html"
              }
          }
      })

      .state('createController.tree', {
          url: "/tree",
          views: {
              'equipment': {
                  templateUrl: "templates/createEquip.html"
              }
          }
      })

      .state('tabsController', {
          url: '/tabs',
          abstract: true,
          templateUrl: 'templates/tabsController.html'
      })

      .state('createController', {
          url: '/create',
          abstract: true,
          templateUrl: 'templates/create.html',
          controller: 'createCtrl'
      })

      .state('equip', {
          url: '/equip/:id',
          templateUrl: 'templates/equip.html',
          controller: 'equipCtrl'
      });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/signup');

});