const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    // ,
    // pool: {
    //     max: dbConfig.pool.max,
    //     min: dbConfig.pool.min,
    //     acquire: dbConfig.pool.acquire,
    //     idle: dbConfig.pool.idle
    // }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const db = {};
db.sequelize = sequelize;

//export TUTORIAL model
db.tutorial = require("./tutorials.model.js")(sequelize, DataTypes);

//export TAG model
db.tag = require("./tags.model.js")(sequelize, DataTypes);


//export COMMENT model
db.comment = require("./comments.model.js")(sequelize, DataTypes);

//define the 1:N relationship
db.tutorial.hasMany(db.comment); // tutorialId is added into Comment model as FK
db.comment.belongsTo(db.tutorial);

//define the N:N relationship
db.tag.belongsToMany(db.tutorial, {through:'TutorialTags'});
db.tutorial.belongsToMany(db.tag, {through:'TutorialTags'});



// optional: SYNC
// (async () => {
//     try {
//         await db.sequelize.sync();
//     }
//     catch (e) {
//         console.log(e)
//     }
// })();

// db.sequelize.sync({force:true})
//     .then(() => {
//         console.log('DB is successfully synchronized')
//     })
//     .catch(e => {
//         console.log(e)
//     });



module.exports = db;
