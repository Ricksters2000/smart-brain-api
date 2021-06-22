require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');
const redis = require('redis');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const signout = require('./controllers/signout');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./middlewares/authorization');
const upload = require('./middlewares/uploads');

const db = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URI //{
        //   host : process.env.POSTGRES_HOST,
        //   user : process.env.POSTGRES_USER,
        //   password : process.env.POSTGRES_PASSWORD,
        //   database : process.env.POSTGRES_HOST
        // }
    });
    
//setup redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
// app.use('/public', express.static(__dirname + '/public'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    db.select('*').from('users')
    .then(users => res.json(users))
    .catch(err => res.send('could not get users'));
})

app.post('/signin', signin.signinAuthentication(db, bcrypt, redisClient))
app.post('/signout', signout.handleSignout(redisClient))

app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt, redisClient))

app.get('/profile/:id', auth.requireAuth(redisClient), (req, res) => profile.handleProfileGet(req, res, db))
app.post('/profile/:id', auth.requireAuth(redisClient), upload.imageUploads.single('image'), (req, res) => profile.handleProfileUpdate(req, res, db))
app.post('/profile/image/:id', upload.imageUploads.single('image'), (req, res) => profile.handleProfileUpdateImage(req, res, db))
app.post('/temp', upload.tempUploads.single('image'), profile.handleTempImage)

app.put('/image', auth.requireAuth(redisClient), (req, res) => image.handleImage(req, res, db))
app.post('/imageurl', auth.requireAuth(redisClient), (req, res) => image.handleApiCall(req, res, db))

app.listen(3000, () => {
    console.log('app is running on port 3000');
})

/********
 * / --> res = this is working
 * /signin --> POST = success/fail
 * /register --> POST = return user
 * /profile/:userId --> GET = user
 * /image --> PUT = user
*/