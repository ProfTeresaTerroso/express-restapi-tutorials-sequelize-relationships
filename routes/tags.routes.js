const express = require('express');

const tagController = require("../controllers/tags.controller");

let router = express.Router();

router.use((req, res, next) => {
    const start = Date.now();
    //compare a start time to an end time and figure out how many seconds elapsed
    res.on("finish", () => { // the finish event is emitted once the response has been sent to the client
        const end = Date.now();
        const diffSeconds = (Date.now() - start) / 1000;
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})

/*
POST tags/ : create one tag
GET  tags/ : list all tags (without tutorials)
GET  tags/{id} : list a tag (including the tutorials it appears on)
*/
router.route('/')
    .get(tagController.findAll)
    .post(tagController.createOne);

router.route('/:tagID')
    .get(tagController.findOne)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'TAGS: what???' });
})

module.exports = router;