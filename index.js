const express = require('express');
const app = express();

app.post('/customerorder-webhook', (req, res, next) => {
    try {
            console.log(req.body);
            res.status(200);
            res.end();
    } catch (error) {
            console.log(error);
            next(error);
    }
});

app.listen(7000);



