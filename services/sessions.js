const jwt = require('jsonwebtoken');

const signToken = (email) => {
    const jwtPayload = {email};
    return jwt.sign(jwtPayload, 'JWT_SECRET', {expiresIn: '2 days'});
}

const setToken = (key, value, redisClient) => {
    return Promise.resolve(redisClient.set(key, value))
}

const getAuthTokenId = (req, res, redisClient) => {
    const {authorization} = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if(err || !reply) {
            return res.status(400).json('Unauthorize');
        }

        return res.json({userId: reply})
    })
}

const createSessions = (user, redisClient) => {
    //JWT token and return user data
    const {email, id} = user;
    const token = signToken(email);
    return setToken(token, id, redisClient)
        .then(() => ({success: 'true', userId: id, token}))
        .catch(console.log)
}

module.exports = {
    getAuthTokenId,
    createSessions
}