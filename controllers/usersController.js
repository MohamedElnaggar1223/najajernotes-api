const User = require('../models/User')
// @ts-ignore
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
// @ts-ignore
const bcrypt = require('bcrypt')


// @ts-ignore
const getAllUsers = asyncHandler(async (req, res) => 
{
    const users = await User.find().select('-password').lean()
    if(!users || !users?.length) return res.status(400).json({'message': 'No Users Found!'})
    res.json(users)
})

//@ts-ignore
const getUser = asyncHandler(async (req, res) => 
{
    if(!req?.params?.id) return res.status(400).json({'message': 'ID Must Be Given!'})
    //@ts-ignore
    const user = await User.findOne({_id: req.params.id}).select('-password').lean()
    if(!user) return res.status(400).json({'message': 'No User Found!'})
    res.json(user)
})

// @ts-ignore
const createNewUser = asyncHandler(async (req, res) => 
{
    const { username, password, roles } = req.body
    if(!username || !password || !Array.isArray(roles) || !roles.length) return res.status(400).json({'message': 'Username, Password and Roles Must Be Given!'})
    
    const duplicate = await User.findOne({ username: username}).lean().exec()
    if(duplicate) return res.status(409).json({'message': 'User Already Exists!'})

    const hashedpassword = await bcrypt.hash(password, 10)

    const user = await User.create(
        {
            "username": username,
            "password": hashedpassword,
            "roles": roles
        })
    if(user)
    {
        res.status(201).json({'message': `New User ${username} Created!`})
    }
    else
    {
        res.status(400).json({'message': 'Something Went Wrong!'})
    }
})

// @ts-ignore
const updateUser = asyncHandler(async (req, res) => 
{
    const { id, username, roles, active, password } = req.body
    if(!username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') return res.status(400).json({'message': 'Username, Active, ID and Roles Must Be Given!'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Not Found!', user})

    const duplicate = await User.findOne({ username }).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id) return res.status(409).json({'message': 'Duplicate Username!'})
    
    //@ts-ignore
    user.username = username
    //@ts-ignore
    user.roles = roles
    //@ts-ignore
    user.active = active
    if(password)
    {
        //@ts-ignore
        user.password = await bcrypt.hash(password, 10)
    }

    //@ts-ignore
    const updatedUser = await user.save()
    res.status(201).json({'message': `${updatedUser.username} was Updated`, updatedUser})
})

// @ts-ignore
const deleteUser = asyncHandler(async (req, res) => 
{
    const { id } = req.body
    if(!id) return res.status(400).json({'message': 'User ID required'})

    const notes = await Note.findOne({ user: id }).lean().exec()
    //@ts-ignore
    if(notes) return res.status(400).json({'message': 'User Has Assigned Notes!'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Not Found!'})

    //@ts-ignore
    const result = await user.deleteOne()
    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json({'message': reply})
})

module.exports = { getAllUsers, getUser, createNewUser, updateUser, deleteUser }