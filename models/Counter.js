const mongoose = require('mongoose')

const Counter = new mongoose.Schema(
    {
        ticketsNum: Number
    }
    )

module.exports = mongoose.model('Counter', Counter)