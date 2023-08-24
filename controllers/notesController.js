// @ts-ignore
const User = require('../models/User')
// @ts-ignore
const Note = require('../models/Note')
const Counter = require('../models/Counter')
const asyncHandler = require('express-async-handler')

// @ts-ignore
const getAllNotes = asyncHandler(async (req, res) => 
{
    const notes = await Note.find().lean()

    // If no notes 
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user?.username }
    }))

    res.json(notesWithUser)
})

// @ts-ignore
const createNewNote = asyncHandler(async (req, res) => 
{
    const { user, title, text } = req.body
    if(!user || !title || !text) return res.status(400).json({'message': 'All Fields Must Be Given!'})

    const duplicate = await Note.findOne({ title }).lean().exec()
    if (duplicate) return res.status(409).json({ message: 'Duplicate note title' })

    //@ts-ignore
    //const ticketNum = (await Note.find()).map(note => note.ticket).sort((a, b) => b-a)[0] + 1 || 500
    let ticketNum
    const tickets = (await Counter.find())[0]
    //@ts-ignore
    if(!tickets) 
    {
        await Counter.create({"ticketsNum": 500})
        //@ts-ignore
        ticketNum = (await Counter.find())[0].ticketsNum
    }
    else
    {
        //@ts-ignore
        tickets.ticketsNum = tickets.ticketsNum + 1
        //@ts-ignore
        await tickets.save()
        //@ts-ignore
        ticketNum = tickets.ticketsNum
        
    }
    const newNote = await Note.create({ user, title, text, ticket: ticketNum })

    if(newNote)
    {
        res.status(201).json({'message': `Note ${title} Created Successfully`})
    }
    else
    {
        res.status(400).json({'message': 'Something Went Wrong!'})
    }
})

// @ts-ignore
const updateNote = asyncHandler(async (req, res) => 
{
    const { user, id, title, text, completed } = req.body
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()
    if(!note) return res.status(400).json({'message': 'Note Not Found!'})

    const duplicate = await Note.findOne({ title }).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id) return res.status(409).json({'message': 'Duplicate Notes!'})
    
    //@ts-ignore
    note.user = user
    //@ts-ignore
    note.title = title
    //@ts-ignore
    note.text = text
    //@ts-ignore
    note.completed = completed
    //@ts-ignore
    const updatedNote = await note.save()
    res.json({'message': `Note ${updatedNote.title} was Updated!`})
})

// @ts-ignore
const deleteNote = asyncHandler(async (req, res) => 
{
    const { user, id } = req.body
    if (!id) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()
    if(!note) return res.status(400).json({'message': 'Note Not Found!'})

    //@ts-ignore
    const deletedNote = await note.deleteOne()
    const reply = `Note '${deletedNote.title}' with ID ${deletedNote._id} deleted`
    res.json({'message': reply})
})

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote }