require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
const Joi = require("joi");

const expireTime = 24 * 60 * 60 * 1000; //expires after 1 day (hours * minutes * seconds * millis)

//Users and Passwords (in memory 'database')
var users = []; 

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.use(express.urlencoded({extended: false}));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
		secret: mongodb_session_secret
	}
})

app.use(session({ 
    secret: node_session_secret, //key that will sign cookie
	store: mongoStore, //default is memory store 
	saveUninitialized: true,  //not touched, modify the session, we don't want to save
	resave: true //
}
));

//authentication - distinguish whether the user logged in or not.
app.get('/', (req,res) => {
    if(req.session.authenticated){
        const buttons = `
        <button onclick="window.location.href='/members'">Go to Members Area</button><br>
        <button onclick="window.location.href='/logout'">Log out</button>
        `;
    res.send(`<h1>Hello, ${req.session.name}!</h1>${buttons}`);
    } else {
        const buttons = `
        <button onclick="window.location.href='/signup'">Sign up</button><br>
        <button onclick="window.location.href='/login'">Log in</button>
        `;
        res.send(buttons);
    }
});

//Sign up function
app.get('/signup', (req,res) => {
    var html = `
    create user
    <form action='/submitUser' method='post'>
    <input name='name' type='text' placeholder='name'><br>
    <input name='email' type='email' placeholder='email'><br>
    <input name='password' type='password' placeholder='password'><br>
    <button>Submit</button>
    </form>
    `;
    res.send(html);
});

app.post('/submitUser', async (req,res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object(
		{
			name: Joi.string().alphanum().max(20).required(),
            email:Joi.string().email().required(),
			password: Joi.string().max(20).required()
		});

	const validationResult = schema.validate({name, email, password});
	if (validationResult.error != null) {
        const errors = [];
        if(validationResult.value.name === ''){
            errors.push('name');
        }
        if(validationResult.value.email === ''){
            errors.push('email');
        }
        if(validationResult.value.password === ''){
            errors.push('password');
        }
        const errorMessage = errors.join(', ');

        var html= `
            ${errorMessage}
            is required.<br><br>
            <a href='/signup'>Try again</a>
        `;
        res.send(html);
    }else{
        var hashedPassword = await bcrypt.hash(password, saltRounds);

        await userCollection.insertOne({name: name, email: email, password: hashedPassword});
        req.session.authenticated = true;
        req.session.name = name;
        res.redirect('/');
    }
});

app.get('/login', (req,res) => {
    var html = `
    log in
    <form action='/loggingin' method='post'>
    <input name='email' type='email' placeholder='email'><br>
    <input name='password' type='password' placeholder='password'><br>
    <button>Submit</button>
    </form>
    `;
    res.send(html);
});

app.post('/loggingin', async(req,res) => {
    var email = req.body.email;
    var password = req.body.password;


    const schema = Joi.string().max(25).required();
	const validationResult = schema.validate(email);
	if (validationResult.error != null) {
	   console.log(validationResult.error);
	   res.redirect("/login");
	   return;
	}

	const result = await userCollection.find({email: email}).project({name: 1,email: 1, password: 1, _id: 1}).toArray();

	console.log(result);
	if (result.length != 1) {
		console.log("user not found");
        res.send(`User not found. Please <a href="/login">try again</a>.`);
		return;
	}
	if (await bcrypt.compare(password, result[0].password)) {
		console.log("correct password");
		req.session.authenticated = true;
		req.session.email = email;
        req.session.name = result[0].name;
		req.session.cookie.maxAge = expireTime;

		res.redirect('/loggedIn');
		return;
	}
	else {
		console.log("incorrect password");
        res.send(`Incorrect password. Please <a href="/login">try again</a>.`);
		return;
	}
});

app.get("/loggedin", (req, res) => {
    if (!req.session.authenticated) {
        res.redirect("/login");
    } else {
        res.redirect("/members");
    }
});

const imageURL = [
    "cat1.jpg",
    "cat2.jpg",
    "cat3.jpg"
];

app.get('/members', (req,res) => {
    if (!req.session.name) {
        res.redirect("/");
        return;
    }
    
    const name = req.session.name;
    const image = imageURL[Math.floor(Math.random() * imageURL.length)];
    
    const html = `
        <h1>Hello, ${name}!</h1>
        <img src="/${image}" alt="Random image" style="width:500px">
        <br>
        <button onclick="window.location.href='/logout'">Log out</button>
    `;
    res.send(html);
});

app.get('/logout', (req,res) => {
	req.session.destroy();
    res.redirect('/');
});

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
	res.status(404);
	res.send("Page not found - 404");
})

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 