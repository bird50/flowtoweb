var app = angular.module("myApp",['lbServices','ngMaterial','ngMessages','material.svgAssetsCache']);
// compare email input 
app.directive('sameAs', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {
        ngModel.$parsers.unshift(validate);
        
        // Force-trigger the parsing pipeline.
        scope.$watch(attrs.sameAs, function () {
          ngModel.$setViewValue(ngModel.$viewValue);
        });
        
        function validate(value) {
          var isValid = scope.$eval(attrs.sameAs) == value;
          
          ngModel.$setValidity('same-as', isValid);
        
          return isValid ? value : undefined;
        }
      }
    };
  });
// angular material datepicker format
app.config(function($mdDateLocaleProvider){
    var shortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    $mdDateLocaleProvider.months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    $mdDateLocaleProvider.shortMonths = shortMonths;
    $mdDateLocaleProvider.days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    $mdDateLocaleProvider.shortDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
        return shortMonths[date.getMonth()] + ' ' + (date.getFullYear() + 543);
    };
    $mdDateLocaleProvider.formatDate = function(date) {
        return `${moment(date).format('DD/MM')}/${moment(date).get('year') + 543}`;
    };
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var dateArray = dateString.split("/");
        dateString = dateArray[1] + "/" + dateArray[0] + "/" + (dateArray[2] - 543);
        var m = moment(dateString, 'L', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
  });

app.controller("Myctrl", function($scope,$filter,$window,Account,Empemail) {
  $scope.myDate = new Date();
  $scope.isOpen = false;
  $scope.emp;
  $scope.email="";
  $scope.emailRepeated="";
  $scope.query = {};
  $scope.queryBy = '$';
  $scope.loading=false;

  $scope.searchEmp = function() {
    var log = [];
    Account.find({
          filter: {
            where: {
                'ORG_NAME': $scope.key
              },
            order: 'ORG_NAME DESC',
            limit: 2000
          }
        }).$promise.then(function(data){
          $scope.AllOrg = data;
          //console.log($scope.AllOrg);
        });
    /*Empemail.find({
              filter: {
                where: {
                    'PER_ID': $scope.emp.PER_ID
                  }
              }
            }).$promise.then(function(data){
              $scope.empemail = data[0];
      //console.log(data[0]);
      console.log($scope.email.emp_email);
    });*/
    //console.log($scope.key); 
    //console.log($scope.AllOrg);
  }

  $scope.modalEmp = function(emp) {  //click modal
    $scope.isOpen = true;
    $scope.loading=true;
    $scope.emp = emp;
    console.log("modalEmp()");
    console.log(emp);
    console.log("----------------------");
  }

  $scope.showEmail = function(emp) {
    $scope.emp = emp;
    Empemail.find({
              filter: {
                where: {
                    'PER_ID': $scope.emp.PER_ID
                  }
              }
            }).$promise.then(function(data){
              $scope.empemail = data[0];
      //console.log($scope.empemail);
    });
  }

// check Birthdate and update email to Empemail Model
$scope.chkBD = function(){
    $scope.loading=true;
    var emp = $scope.AllOrg;
    $scope.myBD = $scope.emp.PER_BIRTHDATE; //PER_BIRTHDATE
    $scope.BD = $scope.myDate;    //input BD
    // filter date format
    $scope.filter_BD = $filter('date')($scope.myDate, "yyyy-MM-dd");

    console.log($scope.BD);
    console.log($scope.filter_BD);
    console.log($scope.email);
    console.log($scope.emailRepeated);
    if($scope.myBD == $scope.filter_BD && $scope.email == $scope.emailRepeated){
	/*
      Empemail.find({
              filter: {
                where: {
                    'PER_ID': $scope.emp.PER_ID
                  }
              }
            }).$promise.then(function(data){
              // get id from PER_ID 
				if(data.length>0){
	                $scope.emailresult = data[0];
	                $scope.updateEmail($scope.emailresult.id);
				}else{
					
				}
              
             // $scope.clearModal();
              //console.log($scope.emailresult);
            });
	*/
		var data_update={
			"id":$scope.emp.PER_ID,
			"emp_email":$scope.email,
			"PER_ID":$scope.emp.PER_ID
		};
		$scope.upsert_email(data_update);
		
    }else{
      $window.alert("Your birthdate is not correct, Please try again");
      $scope.clearModal();      
    }
	
		
    console.log("*************************");
  }

$scope.updateEmail = function(email_result){
	
	// ที่จริงตรงนี้ต้อง upsert
	
  Empemail.prototype$updateAttributes(
     {id: email_result},
     {emp_email: $scope.email}
  ).$promise
  .then(function(dat){
  	$window.alert("Your email is registered");
	 $scope.clearModal();
  },function(err){
  	$window.alert("ไม่สามารถสมัครด้วย email นี้ได้ อาจเพราะมีการใช้ email นี้อยู่แล้ว ของบุคคลอื่น");
  });
}

$scope.upsert_email=function(data_update){
	Empemail.upsert(data_update).$promise
		.then(function(data){
		  	$window.alert("Your email is registered");
			$scope.clearModal();
		},function(err){
		$window.alert("ไม่สามารถสมัครด้วย email นี้ได้ อาจเพราะมีการใช้ email นี้อยู่แล้ว ของบุคคลอื่น");
	});
};

$scope.clearModal = function() {
    $scope.myDate = new Date();
    $scope.email = '';
    $scope.emailRepeated = '';
}

});




  
