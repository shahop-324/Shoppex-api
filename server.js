const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { nanoid } = require('nanoid');
var btoa = require('btoa');

process.on('uncaughtException', (err) => {
  console.log(err)
  console.log('UNCAUGHT Exception! Shutting down ...')
  process.exit(1)
});

dotenv.config({ path: './config.env' })
const cors = require('cors')
const app = require('./app')
const http = require('http')

const server = http.createServer(app)

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB Connection successful')
  })

const port =  8000
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

server.listen(port, () => {
  console.log(`App running on port ${port} ...`)
})

process.on('unhandledRejection', (err) => {
  console.log(err)
  console.log('UNHANDLED REJECTION! Shutting down ...')
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
  server.close(() => {
    process.exit(1)
  })
})