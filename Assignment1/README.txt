v1.6 - "Login" - using BCrypt to compare a user's password
==========================================================
If the passwords are no longer stored in plaintext, how do we tell if the 
password someone is entering when logging in is the same as when they created it?

BCrypt has a function to compare the current password with a previously 
hashed password - bcrypt.compareSync()

Let's use it see if we can "login" as user.

- To Test
Create a user http://localhost:3000/createUser
(remember to create some users - your server likely got rebooted and all users got deleted)
Attempt to log in http://localhost:3000/login
If you put in the same password it should go here: http://localhost:3000/loggedin
If not (wrong password or missing user) it goes back to login page: http://localhost:3000/login

- Notes:
We can access the logged in page (/loggedin) without actually going through the login 
process if we know the direct URL. :O This is BAD, and we'll fix it later


v1.5 - Hash passwords using BCrypt
==================================
Storing passwords in plaintext is BAD. 
VERY BAD.
Let's see how to use BCrypt to hash the passwords so no one can see them
(or steal them).

After hashing the passwords with BCrypt, they should look something like:
$2b$12$s2hrmuKearD75p4dkpTFBebvgGSKxeUOH51CwlnDHCmFcjjMIsuW.

- Follow along instructions:
npm install bcrypt

- To Test:
open browser at: http://localhost:3000/createUser
fill in a username and password, hit submit
You should be sent to /submitUser
And the user added. (Page shows a list of all users)
See the passwords are now hashed (and not plaintext)

- Notes: 
Even 2 people have the same password, their hashed passwords are different.
Try it out, create user1 with password "Password".
Create user2 with password "Password" and confirm their hashes are different.

v1.4 - Create a user using in-memory 'database'
===============================================
In this version we create an in-memory 'database'
where we store the users in an array, but it's only in the server's RAM
so if you restart node or reboot the computer, it gets erased (this is bad
but we'll fix this later).

/createUser  => form for entering username and password to create a new user

- To Test:
open browser at: http://localhost:3000/createUser
fill in a username and password, hit submit
You should be sent to /submitUser
And the user added. (Page shows a list of all users)
The list will grow for each time you post to add a new user

- Notes: 
If you reboot the server (restart nodemon) ALL USERS ARE DELETED! :O
Passwords stored in plaintext!! :O (this is VERY BAD!)


v1.3 - Form fields and POSTs
============================
How do we handle the text input when the user presses the submit button?

In this version we've created a page at /contact and it will
prompt for an email address. When you click on the button, it will
go to /submitEmail and acknowledge the email you entered.
If you didn't enter an email address, it will redirect you back
to /contact with a query parameter that will say the email address is required

- To test:
open browser at: http://localhost:3000/contact
try to hit the submit button (without an email address)
it should redirect to http://localhost:3000/contact?missing=1 
which will show an additional message about the email being required.
This time, put in an email address (ex: a@b.ca) and it will post you email to
http://localhost:3000/submitEmail and echo your email


v1.2 - Catch All and 404s
=========================
What happens if we go to a page that doesn't exist?

Previous versions will give an error message (https://localhost:3000/does_not_exist):
Cannot GET /does_not_exist

Let's fix this!

- To test:
open browser at: https://localhost:3000/does_not_exist
Should not say "Page not found - 404"
(also sends status 404)
Any route (page) not specified before the catch all will give a 404.


v1.1 - Simple Website playing with routes and URL and query params
==================================================================
I want to create a 2nd page at /about to show my name

- To test:
open browser at: https://localhost:3000/about
You should see Patrick Guichon in large print (an <H1> tag)

I want to have my name on the /about page change color
(using a URL parameter ex: /about?color=red OR /about?color=green OR /about?color=%239000C0)

- To test:
open browser at: https://localhost:3000/about?color=blue
You should see Patrick Guichon in blue.
Change the color URL parameter to change the color of the text

I want to display a few of my cats
/cat/1 and /cat/2
(using 'folders' as parameters)
pictures will be in a public folder. 
1 => fluffy.gif
2 => socks.gif

-To Test:
open browser at: https://localhost:3000/cat/1 
 see Cat 1 (fluffy.gif)
open browser at: https://localhost:3000/cat/2 
 see Cat 2 (socks.gif)
open browser at: https://localhost:3000/cat/3 
 see Error message that cat #3 doesn't exist

(You can also test by going to the images directly at https://localhost:3000/cat1.jpg, https://localhost:3000/cat2.jpg and https://localhost:3000/cat3.jpg)

Image Credits: 
"cat1" home
"cat2" home
"cat3" home


v1.0 - Simple Website using Node.js
===================================

- Follow along instructions:
Steps:
1. npm init (all defaults are fine)
2. npm install
3. npm install express
4. create new file index.js


- Instructions to run:
npm install
nodemon index.js

- Git:
add a .gitignore to ignore all files in /node_modules

- To test:
open browser at: https://localhost:3000
You should see Hello World in large print (an <H1> tag)

- Notes:
You can go to the root, but no other sites
You will get an error for example if you go to /about or /login 
  (there's no code to handle these routes)