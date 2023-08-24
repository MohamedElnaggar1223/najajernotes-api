const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => 
{
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({'message': 'Unauthorized By Server'})

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        // @ts-ignore
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => 
        {
            if(err) return res.status(403).json({'message': 'Forbidden By Server'})
            // @ts-ignore
            req.user = decoded.UserInfo.username
            // @ts-ignore
            req.roles = decoded.UserInfo.roles
            next()
        }
    )
}

module.exports = verifyJWT