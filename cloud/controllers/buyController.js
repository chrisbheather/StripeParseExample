var _ = require('underscore');

var Course = Parse.Object.extend('Course');
var CourseSession = Parse.Object.extend('CourseSession');
var Purchase = Parse.Object.extend('Purchase');

exports.checkoutPage = function(req,res) {
	var checkoutId = req.params.id;
	
	var query = new Parse.Query(CourseSession);
	query.include('course');
	query.get(checkoutId, {
	  success: function(session) {
	    session.get('course').get('provider').fetch().then(function(provider){
		    var errorMessage = null;
		    //Track the checkout page render event
		    var dimensions = {
		    	sessionId: session.id,
		    	courseId: session.get('course').id,
		    	title: session.get('course').get('title')
		    };
		    Parse.Analytics.track('checkoutView', dimensions);
		    
		    res.render('checkout/checkout', { 
					session: session,
					course: session.get('course'),
					provider: provider,
					errorMessage: errorMessage
				});
	    });
	  },
	  error: function(object, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    res.send(500, 'Failed loading course checkout');
	  }
	});
};

exports.chargeCard = function(req, res) {
	var stripeToken = req.body.stripeToken;
	
	var courseSessionId = req.body.sessionId;
	var userName = _.escape(req.body.userName);
	var userEmail = _.escape(req.body.userEmail);

	// if (!userName || !userEmail) {
	// 	var  errorMessage = "Please enter your name and email address";
	// 	renderCheckoutError(errorMessage);
	// }

	//get session to check if there are seats available
	var query = new Parse.Query(CourseSession);
	query.include('course');
	query.get(courseSessionId, {
	  success: function(session) {
			if (session.get('seatsAvailable') > 0) {
				Parse.Cloud.run('chargeCard', { 
						stripeToken: stripeToken ,
						price: session.get('price'),
						courseSessionId: session.id
					}, {
				  success: function(ratings) {
				  	//subctract a sear
				  	session.increment('seatsAvailable', -1);
				  	session.save();
				  	//track purchase event
				  	var dimensions = {
		    			session: session.id,
		    			courseId: session.get('course').id,
		    			title: session.get('course').get('title')
		   			};
		   			Parse.Analytics.track('purchaseMade', dimensions);
		   			//Send payment confirmation email
		   			Parse.Cloud.run('paymentEmail', {
		   				userName: userName,
		   				userEmail:userEmail,
		   				courseTitle: session.get('course').get('title'),
		   				startDate: session.get('startDate'),
		   				endDate: session.get('endDate'),
		   			},{
		   				success:function(){
		   				
		   				},
		   				error:function(){

		   				}
		   			});
	   				var purchase = new Purchase();
   					purchase.set('courseSession', session);
   					purchase.set('userName', userName);
   					purchase.set('userEmail', userEmail);

   					purchase.save().then(function(purchase){
   						res.redirect('/confirmation/'+purchase.id);		
   					});
				  },
				  error: function(error) {
				  	var  errorMessage = "There was a problem charging your card, please try again";
						res.render('checkout/checkout', { 
							errorMessage: errorMessage,
							session: session,
							course: session.get('course'),
							provider: provider
						});
				  }
				});
			} else {
				//Course has no seats Available
				session.get('course').get('provider').fetch().then(function(provider){
					var  errorMessage = "Sorry this course is full";
					res.render('checkout/checkout', { 
						errorMessage: errorMessage,
						session: session,
						course: session.get('course'),
						provider: provider
					});
				});


			}
	  },
	  error: function(object, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    res.send(500, 'Failed making purchase');
	  }
	});
};

var renderCheckoutError = function(errorMessage){
	res.render('checkout/checkout', { 
		errorMessage: errorMessage,
		session: session,
		course: session.get('course'),
		provider: provider
	});
};

exports.confirmationPage = function(req, res){
	var purchaseId = req.params.id;
	
	var query = new Parse.Query(Purchase);
	query.include('courseSession');
	query.get(purchaseId, {
	  success: function(purchase) {
	    var session = purchase.get("courseSession");
	    session.get('course').fetch().then(function(course){
	    	course.get('provider').fetch().then(function(provider){    
			    res.render('checkout/confirmation', { 
						sessions: [session],
						course: course,
						provider: provider,
					});
	    });
	  });
	  },
	  error: function(object, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    res.send(500, 'Failed loading course confirmation');
	  }
	}); 

	// var query = new Parse.Query(CourseSession);
	// query.include('course');
	// query.get(checkoutId, {
	//   success: function(session) {
	//     session.get('course').get('provider').fetch().then(function(provider){
	    
	//     res.render('checkout/confirmation', { 
	// 			sessions: [session],
	// 			course: session.get('course'),
	// 			provider: provider,
	// 		});
	//   });
	//   },
	//   error: function(object, error) {
	//     // The object was not retrieved successfully.
	//     // error is a Parse.Error with an error code and message.
	//     res.send(500, 'Failed loading course confirmation');
	//   }
	// }); 
};

exports.test = function(req, res) {
	res.render('hello', { 
		message: "HELLo"
	});
};

exports.createUser = function(req, res) {
	console.log(_.pick(req.body, 'title'));
	res.redirect('/');
  // var course = new Course();

  // // Explicitly specify which fields to save to prevent bad input data
  // course.save(_.pick(req.body, 'title')).then(function() {
  //   res.redirect('/');
  // },
  // function() {
  //   res.send(500, 'Failed saving post');
  // });
	// };
};