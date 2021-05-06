const db = require("../models/index.js");
const Tutorial = db.tutorial;
const Comment = db.comment;
const Tag = db.tag;
//necessary for LIKE operator
const { Op } = require('sequelize');

// calculates limit and offset parameters for Sequelize Model method findAndCountAll(), 
// from API request query parameters: page and size
const getPagination = (page, size) => {
    const limit = size ? size : 3; // limit = size (default is 3)
    const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

    return { limit, offset };
};

// function to map default response to desired response data structure
// {
//     "totalItems": 8,
//     "tutorials": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
const getPagingData = (data, page, limit) => {
    // data Sequelize Model method findAndCountAll function has the form
    // {
    //     count: 5,
    //     rows: [
    //              tutorial {...}
    //         ]
    // }
    const totalItems = data.count;
    const tutorials = data.rows;
    const currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, tutorials, totalPages, currentPage };
};

// Display list of all tutorials
exports.findAll = (req, res) => {
    //get data from request query string
    let { page, size, title } = req.query;
    const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Page number must be 0 or a positive integer' });
        return;
    }
    else
        page = parseInt(page); // if OK, convert it into an integer
    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Size must be a positive integer' });
        return;
    } else
        size = parseInt(size); // if OK, convert it into an integer

    // convert page & size into limit & offset options for findAndCountAll
    const { limit, offset } = getPagination(page, size);

    Tutorial.findAndCountAll({ where: condition, limit, offset })
        .then(data => {
            // convert response data into custom format
            const response = getPagingData(data, offset, limit);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};




exports.createTutorial = (req, res) => {
    // Save Tutorial in the database
    Tutorial.create(req.body)
        .then(data => {
            res.status(201).json({ message: "New tutorial created.", location: "/tutorials/" + data.id });
        })
        .catch(err => {
            if (err.name === 'SequelizeValidationError')
                res.status(400).json({ message: err.errors[0].message });
            else
                res.status(500).json({
                    message: err.message || "Some error occurred while creating the Tutorial."
                });
        });
};

// List just one tutorial
exports.findOne = (req, res) => {
    Tutorial.findByPk(req.params.tutorialID,
        {
            include: [
                {
                    model: Comment, attributes: ["id", "author", "text"] //WITHOUT data from comments
                },
                {
                    model: Tag, through: { attributes: [] } // remove ALL data retrieved from join table
                }
            ]
        }
    )
        .then(data => {
            // no data returned means there is no tutorial in DB with that given ID 
            if (data === null)
                res.status(404).json({
                    message: `Not found Tutorial with id ${req.params.tutorialID}.`
                });
            else
                res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error retrieving Tutorial with id ${req.params.tutorialID}.`
            });
        });
};

exports.update = (req, res) => {
    // validate request body data
    if (!req.body || !req.body.title) {
        res.status(400).json({ message: "Request can not be empty!" });
        return;
    }

    // validate request body data
    if (!req.body || !req.body.title) {
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }
    Tutorial.findByPk(req.params.tutorialID)
        .then(tutorial => {
            // no data returned means there is no tutorial in DB with that given ID 
            if (tutorial === null)
                res.status(404).json({
                    message: `Not found Tutorial with id ${req.params.tutorialID}.`
                });
            else {
                Tutorial.update(req.body, { where: { id: req.params.tutorialID } })
                    .then(num => {
                        // check if one comment was updated (returns 0 if no data was updated)
                        if (num == 1) {
                            res.status(200).json({
                                message: `Tutorial id=${req.params.tutorialID} was updated successfully.`
                            });
                        } else {
                            res.status(200).json({
                                message: `No updates were made on Tutorial id=${req.params.tutorialID}.`
                            });
                        }
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: `Error updating Tutorial with id=${req.params.id}.`
            });
        });
};

exports.delete = (req, res) => {
    Tutorial.destroy({ where: { id: req.params.tutorialID } })
        .then(num => {
            // check if one tutorial was deleted
            if (num == 1) {
                res.status(200).json({
                    message: `Tutorial with id ${req.params.tutorialID} was successfully deleted!`
                });
            } else {
                res.status(404).json({
                    message: `Not found Tutorial with id=${req.params.tutorialID}.`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error deleting Tutorial with id=${req.params.tutorialID}.`
            });
        });
};

// Display list of all published tutorials
exports.findAllPublished = (req, res) => {
    //get data from request query string
    const { page, size } = req.query;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Page number must be 0 or a positive integer' });
        return;
    }
    else
        page = parseInt(page); // if OK, convert it into an integer
    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Size must be a positive integer' });
        return;
    } else
        size = parseInt(size); // if OK, convert it into an integer

    // convert page & size into limit & offset options for findAndCountAll
    const { limit, offset } = getPagination(page, size);

    Tutorial.findAndCountAll({ where: { published: true }, limit, offset })
        .then(data => {
            // convert response data into custom format
            const response = getPagingData(data, offset, limit);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};


// Display list of all published tutorials
exports.findAllCommented = async (req, res) => {
    try {
        let data = await Tutorial.findAll(
            {
                include: {
                    model: Comment, required: true
                    , attributes: [] //WITHOUT data from comments
                }
            })
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving commented tutorials."
        });
    };
};


// Add one tag to one tutorial
exports.addTag = (req, res) => {
    Tutorial.findByPk(req.params.tutorialID)
        .then(tutorial => {
            // no data returned means there is no tutorial in DB with that given ID 
            if (tutorial === null)
                res.status(404).json({
                    message: `Not found Tutorial with id ${req.params.tutorialID}.`
                });
            else {
                Tag.findByPk(req.params.tagID)
                    .then(tag => {
                        // no data returned means there is no tag in DB with that given ID 
                        if (tag === null)
                            res.status(404).json({
                                message: `Not found Tag with id ${req.params.tagID}.`
                            });
                        else {
                            // console.log(tag)
                            // console.log(tutorial)
                            tag.addTutorial(tutorial)
                                .then(data => {
                                    // console.log(data);
                                    if (data === undefined)
                                        res.status(200).json({
                                            message: `Tag ${req.params.tagID} was already assigned to Tutorial ${req.params.tutorialID}.`
                                        });
                                    else
                                        res.status(200).json({
                                            message: `Added Tag ${req.params.tagID} to Tutorial ${req.params.tutorialID}.`
                                        });
                                })
                        }
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || `Error adding Tag ${req.params.tagID} to Tutorial ${req.params.tutorialID}.`
            });
        });
};

// Remove one tag from one tutorial
exports.deleteTag = async (req, res) => {
    try {
        let tutorial = await Tutorial.findByPk(req.params.tutorialID)

        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null) {
            res.status(404).json({
                message: `Not found Tutorial with id ${req.params.tutorialID}.`
            });
            return;
        }

        let tag = await Tag.findByPk(req.params.tagID)

        // no data returned means there is no tag in DB with that given ID 
        if (tag === null) {
            res.status(404).json({
                message: `Not found Tag with id ${req.params.tagID}.`
            });
            return;
        }

        let data = await tag.removeTutorial(tutorial)

        // console.log(data);
        if (data === 1)
            res.status(200).json({
                message: `Removed Tag ${req.params.tagID} to Tutorial ${req.params.tutorialID}.`
            });
        else
            res.status(200).json({
                message: `No Tag ${req.params.tagID} associated to Tutorial ${req.params.tutorialID}.`
            });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || `Error adding Tag ${req.params.tagID} to Tutorial ${req.params.tutorialID}.`
        })
    };
};

// Display list of all tags for a given tutorial (with tutorial info)
exports.getTags = (req, res) => {
    // console.log(req.params.tutorialID)
    Tutorial.findByPk(req.params.tutorialID,
        {
            include: {
                model: Tag,
                through: { attributes: [] } //remove data retrieved from join table
            }
        })
        .then(data => {
            if (data === null)
                res.status(404).json({
                    message: `Not found Tutorial with id ${req.params.tutorialID}.`
                });
            else
                res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: `Error retrieving Tags for Tutorial with id ${req.params.tutorialID}.`
            });
        });
};


// Display list of all tutorials with tags
exports.findAllTagged = (req, res) => {
    Tutorial.findAll(
        {
            include: {
                model: Tag, required: true, through: { attributes: [] } //remove data retrieved from join table
            }
        })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving commented tutorials."
            });
        });
};