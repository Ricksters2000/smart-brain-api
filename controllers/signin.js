const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json('missing email or password');
    }

    // Load hash from your password DB.
    // bcrypt.compare("apples", '$2a$10$BnKKYGrMiiC/sPyEhY07SOl6g9DhzJLbCFYucKXkrlFXC81NOEYrm', function(err, res) {
    //     console.log(res);
    // });
    // bcrypt.compare("veggies", '$2a$10$BnKKYGrMiiC/sPyEhY07SOl6g9DhzJLbCFYucKXkrlFXC81NOEYrm', function(err, res) {
    //     console.log(res);
    // });

    db.select('email', 'hash').from('login')
        .where({email: email, })
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if(isValid) {
                return db.select('*').from('users').where('email', email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'));
            } else res.status(400).json('wrong credentials');
        })
        .catch(err => res.status(400).json('wrong email or password'))
}

module.exports = {
    handleSignin: handleSignin
}