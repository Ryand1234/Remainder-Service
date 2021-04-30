const express = require('express')
require('dotenv').config()
var httpLogger = require('./util/httplogger')
var cron = require('node-cron')
var bodyParser = require('body-parser')
var { MongoClient } = require('mongodb')
var sendEmail = require('./util/sendmail')

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
cron.schedule("00 12 5 * * * *", async() => {
  console.log('--------------------------')
  console.log('RUNNING CRON JOB')
  MongoClient.connect(process.env.MONGODB_URI, (error, client) => {
    var db = client.db('remainder').collection('notification')
    var startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    db.find({ date: { $lte: new Date(startDate)} }).toArray(async(err, res)=>{
      res.forEach(async(data) => {
        await sendEmail(data.to, data.subject, data.content)
      })
    })
    db.deleteMany({ date: { $lte: new Date(startDate)} })
  })
})


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Running on Port ${process.env.PORT || 3000}`)
})