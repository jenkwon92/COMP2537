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

const expireTime = 60 * 60 * 1000; //expires after 1 hour (minutes * seconds * millis)

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
	saveUninitialized: false,  //not touched, modify the session, we don't want to save
	resave: true
    })
);

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
    <form action='/signupSubmit' method='post'>
    <input name='name' type='text' placeholder='name'><br>
    <input name='email' type='email' placeholder='email'><br>
    <input name='password' type='password' placeholder='password'><br>
    <button>Submit</button>
    </form>
    `;
    res.send(html);
});

app.post('/signupSubmit', async (req,res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    if (!name || !email || !password) {
        res.send(`All fields are required. <br><br>Please <a href='/signup'>try again</a>`);
        return;
    }

    const schema = Joi.object({
        name: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required(),
        email: Joi.string().email().required(),
    });

    const validationResult = schema.validate({ name, password, email });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        var errorMessage = validationResult.error.details[0].message;
        res.send(`Error: ${errorMessage}. <br><br> Please <a href="/signup">try again</a>.`);
        return;
    }

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({
        name: name,
        password: hashedPassword,
        email: email,
    });
    console.log("Inserted user");

    req.session.authenticated = true;
    req.session.name = name;
    req.session.cookie.maxAge = expireTime;

    res.redirect("/members");
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

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.send(`Please fill out both email and password fields. <br><br> Please <a href='/login'>try again</a>.`);
        return;
    }

    const result = await userCollection
        .find({ email: email })
        .project({ username: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);
    if (result.length === 0) {
        res.send('Invalid email/password. <br><br> Please <a href="/login">try again</a>.');
        return;
    } else if (result.length != 1) {
        res.redirect("/login");
        return;
    }
    if (await bcrypt.compare(password, result[0].password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.email = email;
        req.session.username = result[0].username;
        req.session.cookie.maxAge = expireTime;

        res.redirect("/loggedin");
        return;
    } else {
        res.send('Invalid email/password. <br><br> Please <a href="/login">try again</a>.');
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

app.get('/nosql-injection', async (req,res) => {
	var username = req.query.user;

	if (!username) {
		res.send(`<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`);
		return;
	}
	console.log("user: "+username);

	const schema = Joi.string().max(20).required();
	const validationResult = schema.validate(username);

	//If we didn't use Joi to validate and check for a valid URL parameter below
	// we could run our userCollection.find and it would be possible to attack.
	// A URL parameter of user[$ne]=name would get executed as a MongoDB command
	// and may result in revealing information about all users or a successful
	// login without knowing the correct password.
	if (validationResult.error != null) {  
        console.log(validationResult.error);
        res.send("<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>");
        return;
	}	

	const result = await userCollection.find({username: username}).project({username: 1, password: 1, _id: 1}).toArray();

	console.log(result);

    res.send(`<h1>Hello ${username}</h1>`);
});

const imageURL = [
    "cat1.jpg",
    "cat2.jpg",
    "cat3.jpg"
];

app.get('/members', (req,res) => {
    if (!req.session.name) {
        res.redirect("/login");
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

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
	res.status(404);
	res.send("Page not found - 404");
})

app.listen(port, () => {
	console.log("Assignment 1 Node application listening on port "+port);
}); 