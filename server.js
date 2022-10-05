const express = require('express');
const path = require('path');
const app = express();
//const port = 3000;
const port = 5353;
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(port);