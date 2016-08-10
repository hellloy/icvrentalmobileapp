//var MainURL = "http://localhost:2625";
var MainURL = "http://icvrentals.com";
//var MainURL = "http://icv.hellloy.com";
var UserID = '';
angular.module('app.controllers', [])

.controller('signupCtrl', function ($scope, $state, $ionicLoading, $http) {
    $scope.user = {
        name: "mryazanov@lab322.com",
        password: "1111"
    };

    $scope.signIn = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        //console.log($scope.user);
        var URL = MainURL + "/Account/LoginJSON?UserName=" + $scope.user.name + "&Password=" + $scope.user.password;
        $http.post(URL, "").success(function (result, status) {
            //console.log(result);
            $ionicLoading.hide();
            if (result !== false) {
                UserID = result;
                $state.go('main');
            }
            else {
                $ionicLoading.hide();
                $scope.alert = "Email or Password is Incorrect";
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error ! No connection to the server '+status,
                duration: 3000
            });
        });
    };
})

.controller('mainCtrl', function ($scope, $state) {
  
})

.controller('editCtrl', function ($scope, $rootScope, $stateParams, $state, $ionicLoading, $http, $ionicHistory, $ionicActionSheet, $ionicPopup, $location, $timeout, $ionicModal) {
   
    $ionicLoading.show({
        template: 'Loading...'
    });
    $scope.data = {};
    $scope.orderId = $stateParams.id;

    $scope.hide = false;
    $scope.orderCheck = false;
    $scope.check = {
        value: null
    };


    $scope.ExactStatus = false;

    $scope.LoadOrder = function () {
        var URL = MainURL + "/order/GetOrder/" + $stateParams.id;
        $http.get(URL).success(function (result, status) {
            $scope.Equipments = result.Equipments;
            $scope.OrderInfo = result.OrderInfo[0];
            console.log($scope.OrderInfo.status);

            angular.forEach($scope.Equipments, function (value, key) {
                var URL = MainURL + "/Equipment/GetExact/" + value.id;
                $http.get(URL).success(function (result, status) {
                    value.isExact = result;
                })
            });

            $ionicLoading.hide();
            if ($stateParams.idEq !== null && $stateParams.count !== null) {
                console.log($rootScope);
                for (var i = 0; i < $stateParams.count; i++) {

                    $scope.data.idEq = $rootScope.ids[i]
                    $scope.addEquipment();

                }
                // $scope.saveOrder($scope.OrderInfo.status);
            }

        })
    .error(function (data, status, headers, config) {
        $ionicLoading.hide();
    })
    }

    $scope.LoadOrder();


    $scope.GoBack = function () {
        $ionicHistory.goBack();
    };

    $scope.showActionsheet = function (item,indx) {
        $scope.onSwipeRight = function (id) {
            $state.go('equip', { id: $stateParams.id });
        }

        $ionicActionSheet.show({
            titleText: 'Action menu',
            buttons: [
              { text: '<i class="icon ion-ios-plus-outline"></i> Add item (scanner)' },
              { text: '<i class="icon ion-ios-plus-outline"></i> Add item (tree)' },
              { text: '<i class="icon ion-ios-plus-outline"></i> Add item (camera)' },
              { text: '<i class="icon ion-ios-minus-outline"></i> Delete item' },
              { text: '<i class="icon ion-ios-checkmark-outline"></i> Set Exact' }
            ],

            cancelText: 'Cancel',
            cancel: function () {
                console.log('CANCELLED');
            },
            buttonClicked: function (index) {
                console.log('BUTTON CLICKED', index);
                if (index === 0) {
                    $scope.showPopup();
                }
                else if (index === 1) {
                    $scope.onSwipeRight();
                }
                else if (index === 2) {
                    $scope.CamScan();
                }
                else if (index === 3) {
                    //var index = $scope.Equipments.indexOf()
                    console.log(item);
                    $scope.Equipments.splice(indx, 1);
                }
                else if (index === 4) {
                    $scope.showPopupExact(item.id);
                }
                return true;
            }
        });
    };
   
    $scope.showPopupExact = function (id) {
        $ionicLoading.show({
            template: 'Loading...'
        });

        var URL = MainURL + "/Equipment/GetExact/" + id;
        $http.get(URL).success(function (result, status) {
            $ionicLoading.hide();
            $scope.data.ExactStatus = result;
            var myPopup = $ionicPopup.show({
                template: '<ion-toggle toggle-class="toggle-positive" ng-model="data.ExactStatus" >Exact status: </ion-toggle>',
                title: 'Mark Exact Equipment',
                subTitle: 'Please select Exact status',
                scope: $scope,
                buttons: [
                  { text: 'Cancel' },
                      {
                          text: '<b>Save</b>',
                          type: 'button-positive',
                          onTap: function (e) {
                              $scope.setExact(id);
                          }
                      }
                ]
            });
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
        })




    }

    $scope.CamScan = function () {
        cordova.plugins.barcodeScanner.scan(
      function (result) {
          if (result.cancelled != true)
          {
              $scope.addEquipmentCam(result.text)
          }
          else
          {
              alert("Cancelled: " + result.cancelled);
          }
          
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
          {
              "preferFrontCamera": false, // iOS and Android
              "showFlipCameraButton": true, // iOS and Android
              "prompt": "Place a barcode inside the scan area", // supported on Android only
              "formats": "CODE_128", // default: all but PDF_417 and RSS_EXPANDED
              "orientation": "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
          }
        );






    }

    $scope.addEquipmentCam = function (id) {

        $ionicLoading.show({
            template: 'Loading...'
        });
        var repeating = false;
        var URL = MainURL + "/equipment/GetEqCheck/" + id;
        $http.post(URL).success(function (result, status) {
            if (result.Eq) {
                result.Eq[0].count = 10;
                //check added id 
                angular.forEach($scope.Equipments, function (value, key) {
                    if (value.id === result.Eq[0].id) {
                        repeating = true;
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: 'Warning! This equipment has been added to the previously',
                            duration: 2000
                        });
                        return false;
                    }
                });
                if (repeating === false) {
                    $scope.Equipments.push(result.Eq[0]);
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: 'Done! This Equipment added',
                        duration: 2000
                    });
                }

            }
            else {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: 'Error! This Equipment used order #' + result.used,
                    duration: 3000
                });
            }
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error! ' + data,
                duration: 3000
            });
        })
        
    }

    $scope.setExact = function (id) {
        $ionicLoading.show({
            template: 'Set Exact...'
        });
        var data = {
            id: id,
            status: $scope.data.ExactStatus
        }
        var req =
         {
             method: 'POST',
             url: MainURL + "/Equipment/SetExact",
             data: Object.toparams(data),
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }


        $http(req).success(function (result, status) {
            $ionicLoading.hide();
            $scope.LoadOrder();
            $ionicLoading.show({
                template: 'Done..',
                duration: 2000
            });
            $state.go($state.current, {}, { reload: true });
        }).error(function (data, status, headers, config) {
            $ionicLoading.hide();
        })
        console.log($scope.data.ExactStatus);
    }

    $scope.showPopup = function () {


        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="text" enter="addEquipment()" ng-model="data.idEq" autofocus >',
            title: 'Add new Equipment',
            subTitle: 'enter ID',
            scope: $scope,
            buttons: [
              { text: 'Close' }
            ]
        });
    }

    $scope.addEquipment = function () {

        $ionicLoading.show({
            template: 'Loading...'
        });
        var repeating = false;
        var URL = MainURL + "/equipment/GetEqCheck/" + $scope.data.idEq;
        $http.post(URL).success(function (result, status) {
            if (result.Eq) {
                result.Eq[0].count = 10;
                //check added id 
                angular.forEach($scope.Equipments, function (value, key) {
                    if (value.id === result.Eq[0].id) {
                        repeating = true;
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: 'Warning! This equipment has been added to the previously',
                            duration: 2000
                        });
                        return false;
                    }
                });
                if (repeating === false) {
                    $scope.Equipments.push(result.Eq[0]);
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: 'Done! This Equipment added',
                        duration: 2000
                    });
                }

            }
            else {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: 'Error! This Equipment used order #' + result.used,
                    duration: 3000
                });
            }
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error! ' + data,
                duration: 3000
            });
        })
        $scope.data.idEq = null;
    }

    Object.toparams = function ObjecttoParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };


    var addedIds = [];
    $scope.checkBarcode = function () {
        var find = false;

        $ionicLoading.show({
            template: 'Check...'
        });

        //check accepted order
        if ($scope.check.value !== null) {

            var URL = MainURL + "/Equipment/GetEquipmentName/" + $scope.check.value;
            $http.get(URL).success(function (result, status) {
                console.log(result.Equipment[0].Name);
                angular.forEach($scope.Equipments, function (value, key) {
                    if (value.name === result.Equipment[0].Name && value.check !== true) {

                        if (find === false) {
                            find = true;

                            var URLCHECK = MainURL + "/Equipment/GetExact/" + $scope.check.value;
                            $http.get(URLCHECK).success(function (result, status) {
                                if (result === true) {
                                    // check previous
                                    if (addedIds.indexOf($scope.check.value) === -1) {

                                        value.check = true;
                                        if ($scope.OrderInfo.status === 2) {
                                            value.id = $scope.check.value;
                                        }

                                        addedIds.push($scope.check.value);
                                        $ionicLoading.show({
                                            template: 'Done !',
                                            duration: 1000
                                        });
                                        $scope.check.value = null;
                                    }
                                    else {
                                        $ionicLoading.show({
                                            template: 'Error ! This equipment has been check previously',
                                            duration: 2000
                                        });
                                        $scope.check.value = null;
                                    }

                                }
                                else {
                                    // not check previous
                                    value.check = true;

                                    $ionicLoading.show({
                                        template: 'Done !',
                                        duration: 1000
                                    });
                                    $scope.check.value = null;
                                }
                            }).error(function (data, status, headers, config) {
                                $ionicLoading.hide();
                                $scope.check.value = null;
                            })
                        }

                    }
                });
                $ionicLoading.hide();
                if (find === false) {
                    $ionicLoading.show({
                        template: 'This Equipment not found !',
                        duration: 1000
                    });
                }

            }).error(function (data, status, headers, config) {
                $ionicLoading.hide();
            })
        }


        $scope.orderCheck = $scope.inspectCheck();
    }
    $scope.inspectCheck = function () {
        angular.forEach($scope.Equipments, function (value, key) {
            if (value.check === false || value.check === null) {
                return false;
            }
        });
        return true;
    }
    $scope.checkOrder = function () {
        $scope.hide = true;
        $timeout(function () {
            $scope.isFocused = true;
        }, 500);
    }

    $scope.saveOrder = function (status) {
        $ionicLoading.show({
            template: 'Save Order'
        });
        var items = [];
        angular.forEach($scope.Equipments, function (value, key) {
            items.push(value.id)
        });
        console.log(items);
        var data = {
            userID: '1',
            orderStatus: status,
            Days: $scope.OrderInfo.days,
            BDays: $scope.OrderInfo.days,
            datePick: JSON.stringify($scope.OrderInfo.pickupTime),
            dateRet: JSON.stringify($scope.OrderInfo.returnTime),
            items :items,
            id: $scope.orderId,
            itmTxt: 'true'
        }
        var req =
         {
             method: 'POST',
             url: MainURL + "/order/EditOrderJ",
             data: Object.toparams(data),
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }

        $http(req).success(function (result, status) {
            $ionicLoading.hide();
            if (result === "true") {
                $ionicLoading.show({
                    template: 'Done !',
                    duration: 2000
                });

                $state.go('main');
               // $location.path('edit/' + $scope.orderId);
            }
            else {
                $ionicLoading.show({
                    template: status,
                    duration: 4000
                });
            }
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
        })
    }

})

.controller('placedCtrl', function ($scope, $state, $ionicLoading, $http) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL = MainURL + "/order/GetPlacedOrders";
    $http.get(URL).success(function (result, status) {
        $scope.data = result.placed;
        $ionicLoading.hide();
    })
       .error(function (data, status, headers, config) {
           $ionicLoading.hide();
       })
    $scope.ShowOrder = function (orderID) {

    };
    $scope.acceptedOrder = function () {

        var items = [];
        angular.forEach($scope.Equipments, function (value, key) {

            items.push(value.id)
        });
        console.log(items);
        var data = {
            clientId: $scope.user.id,
            orderStatus: 'Placed',
            userID: '1',
            clientEmail: '',
            clientPass: '',
            clientRePass: '',
            clientFName: '',
            clientLName: '',
            Phone: '',
            Company: '',
            datePick: JSON.stringify($scope.dates.start),
            timePick: '',
            Days: $scope.dates.days,
            BDays: $scope.dates.days,
            dateRet: JSON.stringify($scope.dates.end),
            timeRet: '',
            items:items,
            itmTxt: 'true'
        }
        var req =
         {
             method: 'POST',
             url: MainURL + "/order/CreateOrderJ",
             data: Object.toparams(data),
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }

        $http(req).success(function (result, status) {
            $scope.data = result.accepted;
            $ionicLoading.hide();
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
        })
    }

})

.controller('acceptedCtrl', function ($scope, $state, $ionicLoading, $http) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL = MainURL + "/order/GetAcceptedOrders";
    $http.get(URL).success(function (result, status) {
        $scope.data = result.accepted;
        $ionicLoading.hide();
    })
       .error(function (data, status, headers, config) {
           $ionicLoading.hide();
       })
})

.controller('openCtrl', function ($scope, $state, $ionicLoading, $http) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL = MainURL + "/order/GetOpenOrders";
    $http.get(URL).success(function (result, status) {
        $scope.data = result.OpenOrders;
        $ionicLoading.hide();
    })
       .error(function (data, status, headers, config) {
           $ionicLoading.hide();
       })
    $scope.closeOrder = function () {

    }

})

.controller('closedCtrl', function ($scope, $state, $ionicLoading, $http) {
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL = MainURL + "/order/GetClosedOrders";
    $http.get(URL).success(function (result, status) {
        $scope.data = result.placed;
        $ionicLoading.hide();
    })
       .error(function (data, status, headers, config) {
           $ionicLoading.hide();
       })
})

.controller('createCtrl', function ($scope, $state, $ionicLoading, $http, $ionicPopup, $location, $ionicActionSheet) {
    $scope.btn = {};
    $scope.btn.showbtn = false;
    $scope.user = {};
    $scope.user.id = null;
    $scope.dates = {};
    $scope.dates.start = new Date;
    $scope.dates.end = new Date;
    $scope.dates.end.setDate($scope.dates.start.getDate() + 1);
    $scope.dates.TimeStart = new Date();
    $scope.dates.TimeEnd = new Date();
    $scope.dates.TimeStartString = "12:00 AM"
    $scope.dates.TimeEndString = "12:00 AM"
    $scope.dates.days = 1;
    $scope.Equipments = [];
    $scope.createClient = false;

    $scope.forms = {};



    $scope.Go = function (path) {
        $location.path(path);
    };
    $ionicLoading.show({
        template: 'Loading...'
    });

    var URL = MainURL + "/order/GetClientList";
    $http.get(URL).success(function (result, status) {
        $scope.ClientList = result.ClientList;
        $ionicLoading.hide();
    })
    .error(function (data, status, headers, config) {
        $ionicLoading.hide();
    })

    $scope.writeSelectClient = function (selectClientId) {
        $scope.user.id = selectClientId.id;
        console.log($scope.user.id);
    }

    //------------------------load tree Equipment--------------------------//
    $scope.Eq = {};
    $scope.Eq.count = 1;
    $scope.$on('$ionTreeList:ItemClicked', function (event, item) {



        if (item.rel === "eq") {
            console.log(item);


            maxStr = 'Max Equipment count ' + item.max;
            $scope.data = {};

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="Eq.count" autofocus >',
                title: 'Add Equipment count',
                subTitle: maxStr,
                scope: $scope,
                buttons: [
                  { text: 'Cancel' },
                  {
                      text: '<b>Ok</b>',
                      type: 'button-positive',
                      onTap: function (e) {


                          if ($scope.Eq.count <= item.max) {

                              var _adEq = {};
                              var ids = []

                              for (var i = 0; i < $scope.Eq.count; i++) {
                                  //ids.push(item.ids[i]);
                                  //item.ids.splice(i, 1);
                                  $scope.data.idEq = item.ids[i];
                                  $scope.addEquipment();
                              }

                              item.max = item.max - $scope.Eq.count;
                              _adEq.item = item;
                              _adEq.ids = ids;

                              //$scope.Equipments.push(_adEq);
                              //console.log($scope.Equipments);
                              $ionicLoading.show({
                                  template: 'Done ' + item.name + ' has been added',
                                  duration: 2000
                              });

                              //$scope.onSwipeRight(item.id, $scope.Eq.count);
                          } else {
                              $ionicLoading.show({
                                  template: 'Error max items ' + item.max,
                                  duration: 2000
                              });
                          }
                      }
                  }
                ]
            });

        }
    });

    $scope.Equipment = [];
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL1 = MainURL + "/order/GetEquipmentTree";
    $http.post(URL1).success(function (result, status) {
        $scope.data = result;

        angular.forEach(result.children, function (value, key) {
            $scope.Equipment = $scope.Equipment.concat(ParseItem(value));
        });

        $scope.collapse = true;
        $ionicLoading.hide();
    })
   .error(function (data, status, headers, config) {
       $ionicLoading.hide();
   })

    function ParseItem(item) {
        var EqItem = {}

        EqItem.name = item.data.title
        EqItem.id = item.attr.id
        EqItem.rel = item.attr.rel
        if (item.attr.ids !== null) {
            EqItem.ids = item.attr.ids
            EqItem.max = item.attr.ids.length

        }

        if (item.children !== null) {
            EqItem.tree = [];
            angular.forEach(item.children, function (value, key) {
                EqItem.tree.push(ParseItem(value));
            });
        }
        return EqItem;
    }
    //---------------------------------------------------------------------//
    $scope.showActionsheet = function (item) {
        $scope.onSwipeRight = function (id) {
            $state.go('equip', { id: $stateParams.id });
        }

        $ionicActionSheet.show({
            titleText: 'Select input method',
            buttons: [
              { text: '<i class="icon ion-ios-barcode-outline"></i> Add item -scanner' },
              { text: '<i class="icon ion-ios-body-outline"></i> Add item -tree' },
              { text: '<i class="icon ion-ios-camera-outline"></i> Add item -camera' }

            ],
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                console.log('BUTTON CLICKED', index);
                if (index === 0) {
                    $scope.showPopup();
                }
                else if (index === 1) {
                    $location.path('create/tree');
                }
                else if (index === 2) {
                    $scope.CamScan();
                }

                return true;
            }
        });
    };
    $scope.CamScan = function () {
        cordova.plugins.barcodeScanner.scan(
      function (result) {
          if (result.cancelled != true) {
              $scope.addEquipmentCam(result.text)
          }
          else {
              alert("Cancelled: " + result.cancelled);
          }

      },
      function (error) {
          alert("Scanning failed: " + error);
      },
          {
              "preferFrontCamera": true, // iOS and Android
              "showFlipCameraButton": true, // iOS and Android
              "prompt": "Place a barcode inside the scan area", // supported on Android only
              "formats": "CODE_128", // default: all but PDF_417 and RSS_EXPANDED
              "orientation": "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
          }
        );






    }
    $scope.addEquipmentCam = function (id) {

        $ionicLoading.show({
            template: 'Loading...'
        });
        var repeating = false;
        var find = true;
        var _id = id;
        console.log(_id);
        var URL = MainURL + "/equipment/GetEqCheck/" + id;
        $http.post(URL).success(function (result, status) {
            
            if (result.Eq) {
                result.Eq[0].count = 10;
                //check added id 
                angular.forEach($scope.Equipments, function (value, key) {
                    console.log(value.id);
                    if (value.id === result.Eq[0].id) {
                        repeating = true;
                        return false;
                    }
                });

                if (repeating === false) {

                    // if find, check exact
                    //check exact
                    var id = result.Eq[0].id;
                    var URL = MainURL + "/Equipment/GetExact/" + id;
                    $http.get(URL).then(function (response) {

                        var isExact = false;
                        isExact = response.data;
                        if (isExact === true) {

                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Warning! This equipment is Exact, and has been added to the previously',
                                duration: 3000
                            });
                            return null;
                        }
                        else {

                            //get group id
                            //console.log()
                            $http.post(MainURL + "/Equipment/GetEquipmentGroupId/" + id).then(function (resp) {


                                if (resp.data !== "Not Found") {
                                    //get id from tree

                                    var idCheck = GetIdFromTree(resp.data);

                                    if (idCheck === "Not found") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Not found',
                                            duration: 2000
                                        });
                                        return null;
                                    }
                                    else if (idCheck === "No ids") {
                                        $ionicLoading.hide();
                                        //$ionicLoading.show({
                                        //    template: 'Error! Equipment not available',
                                        //    duration: 2000
                                        //});
                                        return null;
                                    }

                                    idCheck;

                                }
                                else {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: 'Error! Group ID not found',
                                        duration: 2000
                                    });
                                    return null;
                                }


                            })


                        }
                    })
                    //var id = GetCheckID(result.Eq[0].id)
                    if (id !== null) {
                        result.Eq[0].id = id;
                        console.log($scope.Equipments);
                        $scope.Equipments.push(result.Eq[0]);
                        $ionicLoading.show({
                            template: 'Done! This Equipment added',
                            duration: 2000
                        });
                    }

                }
                else {

                    //var id = GetCheckID(result.Eq[0].id)


                    // if find, check exact
                    //check exact
                    var id1 = result.Eq[0].id;
                    var URL2 = MainURL + "/Equipment/GetExact/" + id1;
                    $http.get(URL2).then(function (response) {

                        var isExact = false;
                        isExact = response.data;
                        if (isExact === true) {

                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Warning! This equipment is Exact, and has been added to the previously',
                                duration: 3000
                            });
                            return null;
                        }
                        else {

                            //get group id

                            $http.post(MainURL + "/Equipment/GetEquipmentGroupId/" + id1).then(function (resp) {


                                if (resp.data !== "Not Found") {
                                    //get id from tree

                                    var idCheck = GetIdFromTree(resp.data);

                                    if (idCheck === "Not found") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Not found',
                                            duration: 2000
                                        });
                                        return null;
                                    }
                                    else if (idCheck === "No ids") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Equipment not available',
                                            duration: 2000
                                        });
                                        return null;
                                    }

                                    id1 = idCheck;

                                }
                                else {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: 'Error! Group ID not found',
                                        duration: 2000
                                    });
                                    return null;
                                }


                            })


                        }
                    })

                    if (id !== null) {
                        result.Eq[0].id = id;

                        $scope.Equipments.push(result.Eq[0]);
                        console.log($scope.Equipments);
                        $ionicLoading.show({
                            template: 'Done! This Equipment added',
                            duration: 2000
                        });
                    }

                }
            }
            else {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: 'Error! This Equipment used order #' + result.used,
                    duration: 3000
                });
            }
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error! ' + data,
                duration: 3000
            });
        })
        
    }
    $scope.showPopup = function () {
        $scope.data = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="text" enter="addEquipment()" ng-model="data.idEq" autofocus >',
            title: 'Add new Equipment',
            subTitle: 'enter ID',
            scope: $scope,
            buttons: [
              { text: 'Close' }
            ]
        });
    }
    $scope.addEquipment = function () {

        $ionicLoading.show({
            template: 'Loading...'
        });
        var repeating = false;
        var find = true;
        var _id = $scope.data.idEq;
        console.log(_id);
        var URL = MainURL + "/equipment/GetEqCheck/" + $scope.data.idEq;
        $http.post(URL).success(function (result, status) {
            console.log($scope.data.idEq);
            if (result.Eq) {
                result.Eq[0].count = 10;
                //check added id 
                angular.forEach($scope.Equipments, function (value, key) {
                    console.log(value.id);
                    if (value.id === result.Eq[0].id) {
                        repeating = true;
                        return false;
                    }
                });

                if (repeating === false) {

                    // if find, check exact
                    //check exact
                    var id = result.Eq[0].id;
                    var URL = MainURL + "/Equipment/GetExact/" + id;
                    $http.get(URL).then(function (response) {

                        var isExact = false;
                        isExact = response.data;
                        if (isExact === true) {

                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Warning! This equipment is Exact, and has been added to the previously',
                                duration: 3000
                            });
                            return null;
                        }
                        else {

                            //get group id
                            //console.log()
                            $http.post(MainURL + "/Equipment/GetEquipmentGroupId/" + id).then(function (resp) {


                                if (resp.data !== "Not Found") {
                                    //get id from tree

                                    var idCheck = GetIdFromTree(resp.data);

                                    if (idCheck === "Not found") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Not found',
                                            duration: 2000
                                        });
                                        return null;
                                    }
                                    else if (idCheck === "No ids") {
                                        $ionicLoading.hide();
                                        //$ionicLoading.show({
                                        //    template: 'Error! Equipment not available',
                                        //    duration: 2000
                                        //});
                                        return null;
                                    }

                                     idCheck;

                                }
                                else {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: 'Error! Group ID not found',
                                        duration: 2000
                                    });
                                    return null;
                                }


                            })


                        }
                    })
                    //var id = GetCheckID(result.Eq[0].id)
                    if (id !== null) {
                        result.Eq[0].id = id;
                        console.log($scope.Equipments);
                        $scope.Equipments.push(result.Eq[0]);
                        $ionicLoading.show({
                            template: 'Done! This Equipment added',
                            duration: 2000
                        });
                    }

                }
                else {

                    //var id = GetCheckID(result.Eq[0].id)


                    // if find, check exact
                    //check exact
                    var id1 = result.Eq[0].id;
                    var URL2 = MainURL + "/Equipment/GetExact/" + id1;
                    $http.get(URL2).then(function (response) {

                        var isExact = false;
                        isExact = response.data;
                        if (isExact === true) {

                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Warning! This equipment is Exact, and has been added to the previously',
                                duration: 3000
                            });
                            return null;
                        }
                        else {

                            //get group id

                            $http.post(MainURL + "/Equipment/GetEquipmentGroupId/" + id1).then(function (resp) {


                                if (resp.data !== "Not Found") {
                                    //get id from tree

                                    var idCheck = GetIdFromTree(resp.data);

                                    if (idCheck === "Not found") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Not found',
                                            duration: 2000
                                        });
                                        return null;
                                    }
                                    else if (idCheck === "No ids") {
                                        $ionicLoading.hide();
                                        $ionicLoading.show({
                                            template: 'Error! Equipment not available',
                                            duration: 2000
                                        });
                                        return null;
                                    }

                                    id1 = idCheck;

                                }
                                else {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: 'Error! Group ID not found',
                                        duration: 2000
                                    });
                                    return null;
                                }


                            })


                        }
                    })

                    if (id !== null) {
                        result.Eq[0].id = id;

                        $scope.Equipments.push(result.Eq[0]);
                        console.log($scope.Equipments);
                        $ionicLoading.show({
                            template: 'Done! This Equipment added',
                            duration: 2000
                        });
                    }

                }
            }
            else {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: 'Error! This Equipment used order #' + result.used,
                    duration: 3000
                });
            }
        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error! ' + data,
                duration: 3000
            });
        })
         $scope.data.idEq = null;
    }

    function GetCheckID(id) {
        // if find, check exact
        //check exact
        var URL = MainURL + "/Equipment/GetExact/" + id;
        $http.get(URL).then(function (response) {

            var isExact = false;
            isExact = response.data;
            if (isExact === true) {

                $ionicLoading.hide();
                $ionicLoading.show({
                    template: 'Warning! This equipment is Exact, and has been added to the previously',
                    duration: 3000
                });
                return null;
            }
            else {

                //get group id
                //console.log()
                $http.post(MainURL + "/Equipment/GetEquipmentGroupId/" + id).then(function (resp) {


                    if (resp.data !== "Not Found") {
                        //get id from tree

                        var idCheck = GetIdFromTree(resp.data);

                        if (idCheck == "Not found") {
                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Error! Not found',
                                duration: 2000
                            });
                            return null;
                        }
                        else if (idCheck == "No ids") {
                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Error! Equipment not available',
                                duration: 2000
                            });
                            return null;
                        }

                        return idCheck;
                        
                    }
                    else {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: 'Error! Group ID not found',
                            duration: 2000
                        });
                        return null;
                    }


                })


            }
        })

    }

    function GetIdFromTree(idCat) {
         console.log($scope.Equipment[0])
        var result = null;
        var id = 0;
        for (var i = 0; i < $scope.Equipment.length; i++) {

            result = searchTree($scope.Equipment[i], idCat);
            
            if (result != null) {
                //get id 
                if (result.ids != null) {
                    console.log(result.ids);
                    result.max = result.max - 1;
                    id = result.ids[0];
                    result.ids.splice(0, 1);
                    return id
                    break;
                }
                else {
                    return "No ids";
                }


            }
        }

        //else {
        //    return "Not found";
        //}





    }

    function searchTree(element, searchID) {
        // console.log(element);
        if (element.id === searchID) {

            return element;
        }
        else if (element.tree != null) {
            var ret = null;
            
            for (var i = 0; ret == null && i < element.tree.length; i++) {
                
                ret = searchTree(element.tree[i], searchID);
            }
            return ret;
        }

        return null;

    }

    $scope.coundDays = function () {
        if ($scope.dates.start !== null && $scope.dates.end !== null) {
            var diff = Math.abs($scope.dates.start - $scope.dates.end);
            $scope.dates.days = diff / 86400000;
        }
        else {
            $scope.dates.days = 0;
        }
    }
    $scope.checkOrder = function () {
        //check client
        console.log('check order');
        //check dates

        if ($scope.dates.start === null) {
            console.log('Write start date')
        }
        if ($scope.dates.end === null) {
            console.log('Write end date')
        }
        if ($scope.dates.days === 0) {
            console.log('Write days')
        }

        //check equipments
    }
    $scope.checkOrder();
    $scope.startTime = new Date();
    $scope.endTime = new Date();

    $scope.timePickerObjectStart = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
        step: 15,  //Optional
        format: 12,  //Optional
        titleLabel: '12-hour Format',  //Optional
        setLabel: 'Set',  //Optional
        closeLabel: 'Close',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
            timePickerCallbackStart(val);
        }
    };

    function timePickerCallbackStart(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedTime = new Date(val * 1000);

            $scope.dates.TimeStart = selectedTime;
            $scope.dates.TimeStartString = formatAMPM(selectedTime);
        }
    }

    $scope.timePickerObjectEnd = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
        step: 15,  //Optional
        format: 12,  //Optional
        titleLabel: '12-hour Format',  //Optional
        setLabel: 'Set',  //Optional
        closeLabel: 'Close',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
            timePickerCallbackEnd(val);
        }
    };

    function timePickerCallbackEnd(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            console.log(val);
            var selectedTime = new Date(val * 1000);

            $scope.dates.TimeEnd = selectedTime;
            $scope.dates.TimeEndString = formatAMPM(selectedTime);

        }
    }

    function formatAMPM(date) {
        var hours = date.getUTCHours()
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
        //$scope.CheckSave();
    }




    Object.toparams = function ObjecttoParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };

    $scope.saveOrder = function () {
        $ionicLoading.show({
            template: 'Save Order'
        });
        var items = [];
        angular.forEach($scope.Equipments, function (value, key) {

            items.push(value.id)
        });
        console.log(items);
        var data = {
            clientId: $scope.user.id,
            orderStatus: 'Placed',
            userID: UserID,
            clientEmail: $scope.user.email,
            clientPass: $scope.user.password,
            clientRePass: $scope.user.confirmpassword,
            clientFName: $scope.user.firstname,
            clientLName: $scope.user.lastname,
            Phone: $scope.user.phone,
            Company: $scope.user.company,
            datePick: JSON.stringify($scope.dates.start),
            timePick: '',//JSON.stringify($scope.dates.TimeStart),
            Days: $scope.dates.days,
            BDays: $scope.dates.days,
            dateRet: JSON.stringify($scope.dates.end),
            timeRet: '',//JSON.stringify($scope.dates.TimeEnd),
            items :items,
            itmTxt: 'true'
        }
        var req =
         {
             method: 'POST',
             url: MainURL + "/order/CreateOrderJ",
             data: Object.toparams(data),
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }

        $http(req).success(function (result, status) {
            $ionicLoading.hide();
            if (result === "true") {
                $ionicLoading.show({
                    template: 'Done !',
                    duration: 2000
                });
                $location.path('/tabs/placed');
            }
            else {
                $ionicLoading.show({
                    template: result,
                    duration: 4000
                });
            }

        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $ionicLoading.show({
                template: 'Error !',
                duration: 2000
            });
        })
    }
})

.controller('equipCtrl', function ($scope, $state, $ionicLoading, $http, $ionicHistory, $rootScope, $ionicPopup, $stateParams, $location) {
    $scope.btn = {};
    $scope.btn.showbtn = true;
    $scope.Eq = {};
    $scope.Eq.count = 1;

    $scope.GoBack = function () {
        $ionicHistory.goBack();
    };
    $scope.onSwipeRight = function (idEq, count) {
        console.log($stateParams.id);
        console.log(idEq);
        console.log(count);
        $state.go('edit', { id: $stateParams.id, idEq: idEq, count: count });
    }

    var addedEquip = [];

    $scope.$on('$ionTreeList:ItemClicked', function (event, item) {



        if (item.rel === "eq") {
            console.log(item);


            maxStr = 'Max Equipment count ' + item.max;
            $scope.data = {};

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="Eq.count" autofocus >',
                title: 'Add Equipment count',
                subTitle: maxStr,
                scope: $scope,
                buttons: [
                  { text: 'Cancel' },
                  {
                      text: '<b>Ok</b>',
                      type: 'button-positive',
                      onTap: function (e) {


                          if ($scope.Eq.count <= item.max) {

                              var _adEq = {};
                              var ids = []

                              for (var i = 0; i < $scope.Eq.count; i++) {
                                  ids.push(item.ids[i]);
                                  item.ids.splice(i, 1);
                              }

                              item.max = item.max - $scope.Eq.count;
                              _adEq.item = item;
                              _adEq.ids = ids;

                              addedEquip.push(_adEq);
                              console.log(addedEquip);
                              $ionicLoading.show({
                                  template: 'Done ' + item.name + ' has been added',
                                  duration: 2000
                              });

                              //$scope.onSwipeRight(item.id, $scope.Eq.count);
                          } else {
                              $ionicLoading.show({
                                  template: 'Error max items ' + item.max,
                                  duration: 2000
                              });
                          }
                      }
                  }
                ]
            });

        }
    });
    $scope.collapse = true;

    $rootScope.Equipment = [];
    $ionicLoading.show({
        template: 'Loading...'
    });
    var URL = MainURL + "/order/GetEquipmentTree";
    $http.post(URL).success(function (result, status) {
        $scope.data = result;

        GetOrder();
        angular.forEach(result.children, function (value, key) {
            $rootScope.Equipment = $rootScope.Equipment.concat(ParseItem(value));
        });

        $scope.collapse = true;
        $ionicLoading.hide();
    })
   .error(function (data, status, headers, config) {
       $ionicLoading.hide();
   })




    function ParseItem(item) {
        var EqItem = {}

        EqItem.name = item.data.title
        EqItem.id = item.attr.id
        EqItem.rel = item.attr.rel
        if (item.attr.ids !== null) {
            EqItem.ids = item.attr.ids
            EqItem.max = item.attr.ids.length

        }

        if (item.children !== null) {
            EqItem.tree = [];
            angular.forEach(item.children, function (value, key) {
                EqItem.tree.push(ParseItem(value));
            });
        }
        return EqItem;
    }


    function GetOrder() {
        var URL = MainURL + "/order/GetOrder/" + $stateParams.id;
        $http.get(URL).success(function (result, status) {
            $scope.Order = result;
            console.log('Load order equpment' + $scope.Order.Equipments);
            $ionicLoading.hide();
            if ($stateParams.idEq !== null && $stateParams.count !== null) {
                console.log($rootScope);
                for (var i = 0; i < $stateParams.count; i++) {

                    $scope.data.idEq = $rootScope.ids[i]
                    $scope.addEquipment();

                }
                // $scope.saveOrder($scope.OrderInfo.status);
            }

        })
    .error(function (data, status, headers, config) {
        $ionicLoading.hide();
    })
    }

    Object.toparams = function ObjecttoParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };

    function ConvertOrderState(state) {
        var strState = "";

        switch (state) {
            case '1':
                strState = 'Placed';
                break;
            case '2':
                strState = 'Accepted';
                break;
            case '4':
                strState = 'Open';
                break;
            case '5':
                strState = 'Closed';
                break;
            case '3':
                strState = 'Rejected';
                break;
            default:
                strState = 'Placed';

        }
        return strState;
    }

    $scope.SaveOrder = function SaveOrder() {

        $ionicLoading.show({
            template: 'Add items'
        });

        var items = [];
        angular.forEach($scope.Order.Equipments, function (value, key) {
            items.push(value.id);
        });
        console.log('Order items add ' + items);

        angular.forEach(addedEquip, function (value, key) {
            angular.forEach(value.ids, function (data, index) {
                items.push(data)
            });
        });


        console.log('Added items add ' + items);
        var data = {
            userID: '1',
            orderStatus: ConvertOrderState($scope.Order.OrderInfo[0].status),
            Days: $scope.Order.OrderInfo[0].days,
            BDays: $scope.Order.OrderInfo[0].days,
            datePick: JSON.stringify($scope.Order.OrderInfo[0].pickupTime),
            dateRet: JSON.stringify($scope.Order.OrderInfo[0].returnTime),
            items:items,
            id: $stateParams.id,
            itmTxt: 'true'
        }
        var req =
         {
             method: 'POST',
             url: MainURL + "/order/EditOrderJ",
             data: Object.toparams(data),
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }

        $http(req).success(function (result, status) {
            $ionicLoading.hide();
            if (result === "true") {
                $ionicLoading.show({
                    template: 'Done !',
                    duration: 2000
                });
                addedEquip = [];
                //console.log('/edit/' + $stateParams.id + '/null/null');
                $location.path('edit/' + $stateParams.id);
            }
            else {
                $ionicLoading.show({
                    template: result,
                    duration: 4000
                });
            }

        })
        .error(function (data, status, headers, config) {
            $ionicLoading.hide();
        })

    }
})
