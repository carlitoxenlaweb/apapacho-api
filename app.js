const express = require("express")
const logger = require("morgan")
const http = require("http")
const cors = require('cors')
const app = express()

app.use(cors())

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/public", express.static(__dirname + "/public"))
app.set("jwtkey", "c7OovcxXO0OHUBsf8JkgxGiZ0WlLgjbMtGG8Kg9l")

const authMiddleware = require("./middleware/auth")
//const helperMiddleware = require("./middleware/helper")

app.use(`/auth`, require("./routes/auth"))
app.use(`/profile`, authMiddleware, require("./routes/profile"))
app.use(`/`, require("./routes/index"))

//app.use(`/helpers/`, authMiddleware, helperMiddleware, require("./routes/helper/"))

const port = process.env.PORT || 3000
app.set("port", port)

const server = http.createServer(app)
server.listen(port)

module.exports = app
