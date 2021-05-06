require('dotenv').config();         // read environment variables from .env file
const express = require('express'); 
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT || 8080;	 	// if not defined, use port 8080
const host = process.env.HOST || '127.0.0.1'; 	// if not defined, localhost

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

/**Model synchronization
User.sync() - Creates the table if it doesn't exist (and does nothing if it already exists)
User.sync({ force: true }) - Creates the table, dropping it first if it already existed
User.sync({ alter: true }) - Checks what is the current state of the table in the database 
        (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model. */
// const db = require("./models");
// db.sequelize.sync({ alter: true }); //automatically synchronize all models

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- TUTORIALS api' });
});

// routing middleware
app.use('/tutorials', require('./routes/tutorials.routes.js'))
app.use('/tags', require('./routes/tags.routes.js'))

// handle invalid routes
app.get('*', function (req, res) {
	res.status(404).json({ message: 'WHAT???' });
})
app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
