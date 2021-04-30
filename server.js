const express = require('express')
require('dotenv').config()
var httpLogger = require('./util/httplogger')
var cron = require('node-cron')
var bodyParser = require('body-parser')
var { MongoClient } = require('mongodb')
var sendEmail = require('./util/sendmail')
var bcrypt = require('bcryptjs')
var htmlContent = require('./util/erroremail')
var path = require('path')

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
      if(err) {
        let content = htmlContent('MongoDB insertion Error', 5, 'Immediate attention needed')
        await sendEmail('riyandhiman14@gmail.com', 'Error in Remainder Service', content)
      } else {
        res.forEach(async(data) => {
          await sendEmail(data.to, data.subject, data.content)
        })
        db.deleteMany({ date: { $lte: new Date(startDate)} })
      }
    })
  })
})

app.post('/notify', async (req, res) => {
  if(bcrypt.compareSync(req.body.token, process.env.token))
  {
    MongoClient.connect(process.env.MONGODB_URI, (error, client) => {
      var db = client.db('remainder').collection('notification')
      db.insert({
        to: req.body.to,
        date: new Date(req.body.date),
        subject: req.body.subject,
        content: req.body.content
      }, async (err, data) => {
        if(err) {
          let content = htmlContent('MongoDB insertion Error', 5, 'Immediate attention needed')
          await sendEmail('riyandhiman14@gmail.com', 'Error in Remainder Service', content)
          res.status(400).json({ msg: "insertion Error", status: false})
        }
        res.status(200).json({ msg: "Notification Added", status: true})
      })
    }) 
  } else {
    let content = htmlContent('Invalid Token', 1 , 'No attention needed')
    await sendEmail('riyandhiman14@gmail.com', 'Error in Remainder Service', content)
    res.status(400).json({ msg: "invalid token", status: false})
  }
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'util/home.html'))
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Running on Port ${process.env.PORT || 3000}`)
})