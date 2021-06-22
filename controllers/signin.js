const {getAuthTokenId, createSessions} = require('../services/sessions');

const handleSignin = (db, bcrypt, req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return Promise.reject('missing email or password');
    }

    // Load hash from your password DB.
    // bcrypt.compare("apples", '$2a$10$BnKKYGrMiiC/sPyEhY07SOl6g9DhzJLbCFYucKXkrlFXC81NOEYrm', function(err, res) {
    //     console.log(res);
    // });
    // bcrypt.compare("veggies", '$2a$10$BnKKYGrMiiC/sPyEhY07SOl6g9DhzJLbCFYucKXkrlFXC81NOEYrm', function(err, res) {
    //     console.log(res);
    // });

    return db.select('email', 'hash').from('login')
        .where({email: email, })
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if(isValid) {
                return db.select('*').from('users').where('email', email)
                    .then(user => user[0])
                    .catch(err => Promise.reject('unable to get user'));
            } else return Promise.reject('wrong credentials');
        })
        .catch(err => Promise.reject('wrong email or password'))
}



const signinAuthentication = (db, bcrypt, redisClient) => (req, res) => {
    const {authorization} = req.headers;
    return authorization ? getAuthTokenId(req, res, redisClient) : 
        handleSignin(db, bcrypt, req, res).then(data => {
            return data.id && data.email ? createSessions(data, redisClient) : Promise.reject(data);
        }).catch(err => res.status(400).json(err))
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err))
}

module.exports = {
    signinAuthentication,
}