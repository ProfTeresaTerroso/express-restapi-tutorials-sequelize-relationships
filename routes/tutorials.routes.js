const express = require('express');
const commentsRouter = require("./comments.routes");
const tutorialController = require("../controllers/tutorials.controller");

// express router
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



router.route('/')
    .get(tutorialController.findAll)
    .post(tutorialController.createTutorial);


//needs to be BEFORE route /:tutorialID (otherwise, "published" string will be treated as an ID)
router.route('/published')
    .get(tutorialController.findAllPublished)
router.route('/commented')
    .get(tutorialController.findAllCommented)
router.route('/tagged')
    .get(tutorialController.findAllTagged)

router.route('/:tutorialID')
    .get(tutorialController.findOne)
    .put(tutorialController.update)
    .delete(tutorialController.delete);

// list tags for one tutorial
router.route('/:tutorialID/tags')
    .get(tutorialController.getTags)

// add/delete one tag to one tutorial
router.route('/:tutorialID/tags/:tagID')
    .put(tutorialController.addTag)
    .delete(tutorialController.deleteTag);



// you can nest routers by attaching them as middleware:
router.use('/:tutorialID/comments', commentsRouter);


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'TUTORIALS: what???' });
})

module.exports = router;