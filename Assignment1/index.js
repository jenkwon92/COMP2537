const express = require('express');

const port = process.env.PORT || 3000;

const app = express();

app.get('/', (req,res) => {
    res.send("<h1>Hello World!</h1>");
});

app.get('/about', (req,res) => {
    var color = req.query.color;

    res.send("<h1 style='color:"+color+";'>Yongeun Kwon</h1>");
});

app.get('/cat/:id', (req,res) => {

    var cat = req.params.id;

    if (cat == 1) {
        res.send("Yallu1: <img src='/cat1.jpg' style='width:250px;'>");
    }
    else if (cat == 2) {
        res.send("Yallu2: <img src='/cat2.jpg' style='width:250px;'>");
    }
    else {
        res.send("Invalid cat id: "+cat);
    }
});

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
	res.status(404);
	res.send("Page not found - 404");
})

app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 