var _ = require('underscore');
var Course = Parse.Object.extend('Course');
var CourseSession = Parse.Object.extend('CourseSession');

exports.home = function(req,res) {
	var query = new Parse.Query(Course);
	query.equalTo('frontPage', true);
	query.ascending('priority');
	query.include('provider');
	query.find().then(function(results){		
		var homeCourses = results;

		var sessionQuery = new Parse.Query(CourseSession);
		sessionQuery.containedIn("course", homeCourses);
		sessionQuery.find().then(function(homeCourseSessions){
				
				Parse.Analytics.track('homeView');

				res.render('home/home', {
					courses:homeCourses,
					sessions: homeCourseSessions
				});	
		}, function(){
			res.send(500, 'Failed loading sessions');
		});
	},
  function() {
    res.send(500, 'Failed loading courses');
  });
	
};

exports.terms = function(req,res) {
	res.render('home/terms', {});	
};

