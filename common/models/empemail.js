'use strict';

module.exports = function(Empemail) {
    Empemail.getaccount = function(email, cb) {
		var filter={
			"where":{
				"emp_email":email
			},
			"include":{
					"relation":"Account",
					"scope":{
						"fields":{
							"PN_NAME":true,
							"PER_NAME":true,
							"PER_SURNAME":true,
							"ORG_NAME":true,
							"ORG_NAME1":true,
							"PL_NAME":true
						}
					}
				}
		};
       Empemail.findOne(filter,function(err,data){
		   if(err){cb(err);}
		   var result= JSON.parse(JSON.stringify(data));
		   console.log('result:'+JSON.stringify(result));
		   //cb(null,result);
		   
		   if(result){
				if(result.Account!=null){
	 				result.Account.email=email;
	 				cb(null,result.Account);
				}else{
	 			   var error = new Error("Not found");
	 			   error.status = 404;
	 			   cb(error);
			   }
		   }else{
			   var error = new Error("Not found");
			   error.status = 404;
			   //return cb(error);
			   cb(error);
		   }
	   });
     };
     Empemail.remoteMethod('getaccount', {
           accepts: {arg: 'email', type: 'string',required: true},
        	http: {path: '/getaccount/:email', verb: 'get'},
           returns: {arg: 'Account', type: 'Object'}
	   });
};
