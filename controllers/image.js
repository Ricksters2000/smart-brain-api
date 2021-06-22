require('dotenv').config();
const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: process.env.CLARIFAI_KEY
})

const handleApiCall = (req, res) => {
    app.models.predict(Clarifai.FACE_EMBED_MODEL, req.body.input)
    .then(data => {
        res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with api'))
}

const handleImage = (req, res, db) => {
    const {id} = req.body;

    db('users').returning('*').where('id', id).increment({entries: 1})
        .then(user => {
            if(user.length)
                res.json(user[0].entries);
            else
                res.status(400).json('no user found');
        }).catch(err => console.log('error submitting entry'));
}

module.exports = {
    handleImage,
    handleApiCall
}