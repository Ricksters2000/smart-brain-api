const handleProfileGet = (req, res, db) => {
    const {id} = req.params;

    db('users').where('id', id)
        .then(user => {
            if(user.length)
                res.json(user[0]);
            else
                res.status(400).json('user not found');
        })
        .catch(err => res.status(404).json('error getting user'));
}

const handleProfileUpdate = (req, res, db) => {
    const {id} = req.params;
    const {name, age, pet} = req.body;
    const image = getImageDest(req.file);
    db('users').where({id}).update({name, age, pet, image})
        .then(resp => {
            if(resp) {
                res.json('success')
            } else {
                res.status(400).json('unable to update user')
            }
        }).catch(err => res.status(400).json('error updating user'))
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
    res.json(image);
}

const getImageDest = (file) => file.destination.replace('public','') + file.filename;

module.exports = {
    handleProfileGet,
    handleProfileUpdate,
    handleProfileUpdateImage,
    handleTempImage
}