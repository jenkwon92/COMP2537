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