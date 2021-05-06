const db = require("../models/index.js");
const Tutorial = db.tutorial;
const Tag = db.tag;

// Handle Tag creation on POST
exports.createOne = (req, res) => {
    // Save Tag in the database
    Tag.create(req.body)
        .then(data => {
            res.status(201).json({ message: "New Tag created.", location: "/tags/" + data.id });
        })
        .catch(err => {
            if (err.name === 'SequelizeValidationError')
                res.status(400).json({ message: err.errors[0].message });
            else
                res.status(500).json({
                    message: err.message || "Some error occurred while creating the Tag."
                });
        });
};

// Display list of all tags (without tutorials info)
exports.findAll = (req, res) => {
    Tag.findAll()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving Tags."
            });
        });
};

// List just one tag, given its ID (WITH tutorials info, where it appears)
exports.findOne = (req, res) => {
    Tag.findByPk(req.params.tagID, { include: Tutorial })
        .then(data => {
            // no data returned means there is no Tag in DB with that given ID 
            if (data === null)
                res.status(404).json({
                    message: `Not found Tag with id ${req.params.commentID}.`
                });
            else
                res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error retrieving Tag with id ${req.params.commentID}.`
            });
        });
};
