const handleSignout = (redisClient) => (req, res) => {
    const {authorization} = req.headers;
    return authorization ? removeSession(redisClient, authorization) ? res.json({status: 'success'}) : res.json({status: 'failed'}) :
        res.json({status: 'token not found'});
}

const removeSession = (redisClient, auth) => {
    return redisClient.del(auth);
}

module.exports = {
    handleSignout
}