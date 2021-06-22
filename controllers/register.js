const {createSessions} = require('../services/sessions');

const handleRegister = (req, res, db, bcrypt, redisClient) => {
    const {email, name, password} = req.body;
    console.log(req.body);
    if(!email || !name || !password) {
        return res.status(400).json('missing email, name, or password');
    }

    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            trx('users')
            .returning('*')
            .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
            }).then(user => createSessions(user[0], redisClient))
              .then(session => res.json(session))
        })
        .then(trx.commit)
        .catch(err => {
            res.status(400).json('account with this email already exists');
            trx.rollback;
        })
    })
    .catch(err => res.status(400).json('unable to register'));

    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash);
    });
}

module.exports = {
    handleRegister: handleRegister
};