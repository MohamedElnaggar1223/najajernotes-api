const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

//@ts-ignore
const login = asyncHandler(async (req, res) => 
{
    const { username, password } = req.body
    if(!username || !password) return res.status(400).json({'message': 'Username and Password Must Be Given!'})

    const userExists = await User.findOne({ username }).exec()
    //@ts-ignore
    if(!userExists || !userExists.active) return res.status(401).json({'message': 'Unauthorized By Server'})
    //@ts-ignore
    const pwdMatch = await bcrypt.compare(password, userExists.password)
    if(!pwdMatch) return res.status(401).json({'message': 'Wrong Password!'})

    // @ts-ignore
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                // @ts-ignore
                "username": userExists.username,
                // @ts-ignore
                "roles": userExists.roles
            }
        },
        // @ts-ignore
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        {
            // @ts-ignore
            "username": userExists.username,
        },
        // @ts-ignore
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, 
    { 
        httpOnly: true,
        secure: true,
        // @ts-ignore
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })
})

const refresh = (req, res) => 
{
    const cookies = req.cookies

    if(!cookies?.jwt) return res.status(401).json({'message': 'Unauthorized By Server'})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken, 
        // @ts-ignore
        process.env.REFRESH_TOKEN_SECRET, 
        asyncHandler(async (err, decoded) => 
        {
            if(err) return res.status(403).json({'message': 'Forbidden By Server'})

            // @ts-ignore
            const userExists = await User.findOne({username: decoded.username}).exec()
            if(!userExists) return res.status(401).json({'message': 'Unauthorized By Server'})

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        // @ts-ignore
                        "username": userExists.username,
                        // @ts-ignore
                        "roles": userExists.roles
                    }
                }, 
                // @ts-ignore
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m'}
            )
            res.json({ accessToken })
        })
        )
}

// @ts-ignore
const logout = (req, res) => 
{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(204)

    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None'})
    res.json({'message': 'Cookie Cleared'})
}

module.exports = { login, refresh, logout }