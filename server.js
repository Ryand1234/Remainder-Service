const express = require('express')
require('dotenv').config()
var logger = require('./util/logger')
var httpLogger = require('./util/httplogger')
var cron = require('node-cron')
var fs = require('fs')
var bodyParser = require('body-parser')
var { MongoClient } = require('mongodb')

const app = express()
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logErrors)
app.use(errorHandler)
app.use(httpLogger)

// logging functions
function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}
function errorHandler (err, req, res, next) {
  res.status(500).send('Error!')
}

// CRON JOB
cron.schedule("00 12 5 * * *", async() => {
  console.log('--------------------------')
  console.log('RUNNING CRON JOB')
  MongoClient.connect(process.env.MONGODB_URI, (error, client) => {
    var db = client.db('remainder').collection('notification')
    var startDate = new Date()
    startDate.setHours(5)
    startDate.setMinutes(12)
    db.find({ date: { $eq: Date()}, time : { $gt: startDate}}, async(res)=>{
        console.log('Res', res)
      })
  })
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Running on Port ${process.env.PORT || 3000}`)
})