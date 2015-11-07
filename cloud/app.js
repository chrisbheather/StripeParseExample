
// These two lines are required to initialize Express in Cloud Code.
express = require('express');
app = express();
var _ = require('underscore');



//Controllers
var buyController = require('cloud/controllers/buyController.js');

// Global app configuration section
// app.set('views', 'cloud/views');  // Specify the folder to find templates
// app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(express.methodOverride());

// app.locals.parseApplicationId = 'YOUR APP ID'
// app.locals.parseJavascriptKey = 'YOUR JAVASCRIPT KEY';
// app.locals.facebookApplicationId = 'YOUR_FB_APP_ID';

// app.get('/', homeController.home);
// app.get('/checkout/:id', buyController.checkoutPage);
app.post('/charge', buyController.chargeCard);
// app.get('/confirmation/:id', buyController.confirmationPage);
// app.get('/terms', homeController.terms);
// app.get('/test', buyController.test);

// Attach the Express app to Cloud Code.
app.listen();
