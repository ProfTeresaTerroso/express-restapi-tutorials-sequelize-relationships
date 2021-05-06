const db = require("../models/index.js");
const Tutorial = db.tutorial;
const Comment = db.comment;

// Handle comment creation on POST
exports.createComment = async (req, res) => {
    // // Save Comment in the database
    // Comment.create({ author: req.body.author, text: req.body.text, tutorialId: req.params.tutorialID })
    //     .then(data => {
    //         res.status(201).json({ message: "New Comment created.", location: "/tutorials/" + req.params.tutorialID + "/comments/" + data.id });
    //     })
    //     .catch(err => {
    //         if (err.name === 'SequelizeValidationError')
    //             res.status(400).json({ message: err.errors[0].message });
    //         else
    //             res.status(500).json({
    //                 message: err.message || "Some error occurred while creating the Comment."
    //             });
    //     });

    try {
        let tutorial = await Tutorial.findByPk(req.params.tutorialID);

        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null) {
            res.status(404).json({
                message: `Not found Tutorial with id ${req.params.tutorialID}.`
            });
            return;
        }

        let comment = await Comment.create(req.body);
        await tutorial.addComment(comment)

        res.status(201).json({ message: "New Comment created.", location: "/tutorials/" + req.params.tutorialID + "/comments/" + comment.id });

    }
    catch (err) {
        console.log(err)
        if (err.name === 'SequelizeValidationError')
            res.status(400).json({ message: err.errors[0].message });
        else
            res.status(500).json({
                message: err.message || "Some error occurred while creating the Comment."
            });
    }
};

// Display list of all comments for a given tutorial 
exports.findAll = async (req, res) => {
    // // WITH tutorial info
    // Tutorial.findByPk(req.params.tutorialID, { include: Comment })
    //     .then(data => {
    //         if (data === null)
    //             res.status(404).json({
    //                 message: `Not found Tutorial with id ${req.params.tutorialID}.`
    //             });
    //         else
    //             res.status(200).json(data.comments);
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             message: `Error retrieving Comments for Tutorial with id ${req.params.tutorialID}.`
    //         });
    //     });



    try {
        let tutorial = await Tutorial.findByPk(req.params.tutorialID);

        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null) {
            res.status(404).json({
                message: `Not found Tutorial with id ${req.params.tutorialID}.`
            });
            return;
        }
        // WITHOUT tutorial info
        let comments = await tutorial.getComments();
        // console.log(data)
        res.status(200).json(comments);

    }
    catch (err) {
        res.status(500).json({
            message: err.message || `Error retrieving Comments for Tutorial with id ${req.params.tutorialID}.`
        });
    }
};

// List just one comment, given its ID
exports.findOne = async (req, res) => {
    // Comment.findByPk(req.params.commentID)
    //     .then(data => {
    //         // no data returned means there is no Comment in DB with that given ID 
    //         if (data === null)
    //             res.status(404).json({
    //                 message: `Not found Comment with id ${req.params.commentID}.`
    //             });
    //         else
    //             res.status(200).json(data);
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             message: err.message || `Error retrieving Comment with id ${req.params.commentID}.`
    //         });
    //     });
    try {
        let tutorial = await Tutorial.findByPk(req.params.tutorialID);
        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null) {
            res.status(404).json({
                message: `Not found Tutorial with id ${req.params.tutorialID}.`
            });
            return;
        }
        // WITHOUT tutorial info (do not retrieve Tutorial ID)
        let comment = await Comment.findByPk(req.params.commentID
            ,  {attributes: ['id', 'author', 'text']}
            )
        // no data returned means there is no Comment in DB with that given ID 
        if (comment === null) {
            res.status(404).json({
                message: `Not found Comment with id ${req.params.commentID}.`
            });
            return;
        }
        let data = await tutorial.hasComment(comment)
        if (data)
            res.status(200).json(comment);
        else
            res.status(404).json({
                message: `Not found Comment ${req.params.commentID} for Tutorial ${req.params.tutorialID}.`
            });
        return;

    }
    catch (err) {
        res.status(500).json({
            message: err.message || `Error retrieving Comment ${req.params.commentID} for Tutorial ${req.params.tutorialID}.`
        });
    }
};

exports.update = (req, res) => {
    // validate request body data
    if (!req.body || !req.body.text) {
        res.status(400).json({ message: "Request can not be empty!" });
        return;
    }

    Comment.update(req.body, { where: { id: req.params.commentID }, fields: ['author', 'text'] })
        .then(num => {
            console.log(num)
            // check if one comment was updated (returns 0 if no data was updated)
            if (num == 1) {
                res.status(200).json({
                    message: `Comment with id=${req.params.commentID} was updated successfully.`
                });
            } else {
                res.status(404).json({
                    message: `Not found/no updates on Comment with id=${req.params.commentID}.`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error updating Comment with id=${req.commentID.id}.`
            });
        });
};

exports.delete = (req, res) => {
    Comment.destroy({ where: { id: req.params.commentID } })
        .then(num => {
            // check if one comment was deleted
            if (num == 1) {
                res.status(200).json({
                    message: `Comment with id ${req.params.commentID} was successfully deleted!`
                });
            } else {
                res.status(404).json({
                    message: `Not found Comment with id=${req.params.commentID}.`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error deleting Comment with id=${req.params.commentID}.`
            });
        });
};