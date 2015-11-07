
require('cloud/app.js');
var Stripe = require('stripe');
Stripe.initialize('YOUR_STRIPE_KEY');

var Mailgun = require('mailgun');
Mailgun.initialize('mail.prosperpass.co', 'YOUR_MAILGUN_KEY');

var moment = require('moment');

Parse.Cloud.define("chargeCard", function(request, response){
	var stripeToken = request.params.stripeToken;

	var sessionPrice = request.params.price;
	var sessionId = request.params.courseSessionId;

	Stripe.Charges.create({
	  amount: sessionPrice * 100, // $10 expressed in cents
	  currency: "usd",
	  card: stripeToken // the token id should be sent from the client
	},{
	  success: function(httpResponse) {
	    response.success("Purchase made!");
	  },
	  error: function(httpResponse) {
	    response.error("Uh oh, something went wrong");
	  }
	});
});

Parse.Cloud.define("paymentEmail", function(request, response) {
  
	var userName = request.params.userName;
	var userEmail = request.params.userEmail;
	var courseTitle = request.params.courseTitle;
	var startDate = request.params.startDate;
	var endDate = request.params.endDate;

	var emailText = "Dear " + userName +"\n\nCongratulations you are registered for " + courseTitle + " on " + moment(startDate).format('MMM Do') + " starting at " + moment(startDate).format('h:mm a') + "\n\nRefund policy: Cancel at least 48 hours before your class start time and we will offer you a complete refund. To cancel call us at (571) 882-9317\n\n Have a great class!\nYour ProsperPass Team";

  Mailgun.sendEmail({
	  to: userEmail,
	  from: "ProsperPass@prosperpass.co",
	  subject: "Your Class Registration with ProsperPass",
	  text: emailText
	}, {
	  success: function(httpResponse) {
	    console.log(httpResponse);
	    response.success("Email sent!");
	  },
	  error: function(httpResponse) {
	    console.error(httpResponse);
	    response.error("Uh oh, something went wrong");
	  }
	});
});
