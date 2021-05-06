const express = require('express');
//!!!!!
const commentController = require("../controllers/comments.controller");

// set 'mergeParams: true' on the router to access params from the parent router
let router = express.Router({mergeParams: true}); //!!!!!

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

router.route('/')
    .get(commentController.findAll)
    .post(commentController.createComment) //!!!!!

router.route('/:commentID')
    .get(commentController.findOne)
    .put(commentController.update)
    .delete(commentController.delete);


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'COMMENTS: what???' });
})

module.exports = router;