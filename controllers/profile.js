require('dotenv').config();
const {PutObjectCommand} = require('@aws-sdk/client-s3');
const fs = require('fs');

const handleProfileGet = (req, res, db) => {
    const {id} = req.params;

    db('users').where('id', id)
        .then(user => {
            if(user.length) 
                res.json({...user[0], image: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${user[0].image}`});
            else
                res.status(400).json('user not found');
        })
        .catch(err => res.status(404).json('error getting user'));
}

const handleProfileUpdate = (req, res, db, s3Client) => {
    const {id} = req.params;
    const {name, age, pet} = req.body;
    const image = req.file.destination+req.file.filename;

    uploadImage(image, s3Client)
        .then(data => {
            db('users').where({id}).update({name, age, pet, image})
                .then(resp => {
                    if(resp) {
                        res.json('success');
                    } else {
                        res.status(400).json('unable to update user');
                    }
                }).catch(err => res.status(400).json('error updating user', err))
        }).catch(err => res.status(400).json(err))
    
}

const handleProfileUpdateImage = (req, res, db) => {
    const {id} = req.params;
    const image = getImageDest(req.file);
    // const image = req.file.destination.replace('public','') + req.file.filename;
    console.log(req, req.file, id)
    db('users').where({id}).update({image})
        .then(resp => {
            if(resp) {
                res.json('success')
            } else {
                res.status(400).json('unable to update user')
            }
        }).catch(err => res.status(400).json('error updating user'))
}

const handleTempImage = (req, res) => {
    const image = getImageDest(req.file);
    res.json(process.env.HOST+ '/' + image);
}

const uploadImage = (file, s3Client) => {
    // const file = req.file.destination + req.file.filename;
    const fileStream = fs.createReadStream(file);
    console.log('key:', file)
    // Set the parameters
    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        // Add the required 'Key' parameter using the 'path' module.
        Key: file,
        // Add the required 'Body' parameter
        Body: fileStream,
        ACL: 'public-read'
    };
    
    return s3Client.send(new PutObjectCommand(uploadParams))
        .then(data => {
            return data;
        }).catch(err => Promise.reject('error uploading image'))
}

const getImageDest = (file) => file.destination.replace('public','') + file.filename;

module.exports = {
    handleProfileGet,
    handleProfileUpdate,
    handleProfileUpdateImage,
    handleTempImage
}

// app.get('/image', (req, res) => {
//     const bucketParams = {
//         Bucket: S3_BUCKET,
//         Key: req.body.path,
//     };

//     console.log('path', req.body.path);
    
//     const streamToString = (stream) => {
//         return new Promise((resolve, reject) => {
//             const chunks = [];
//             stream.on("data", (chunk) => chunks.push(chunk));
//             stream.on("error", reject);
//             stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
//         });
//     }

//     s3Client.send(new GetObjectCommand(bucketParams))
//         .then(data => {
//             console.log('data', data)
//             streamToString(data.Body)
//                 .then(bodyContents => {
//                     res.json(bodyContents);
//                 }).catch(err => res.status(400).json(err))
//         }).catch(err => res.status(400).json(err))
// })