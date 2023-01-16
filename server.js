const express = require('express')
const route = require('./app/routes/routes')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3004


app.use(express.json({
    limit: "50mb"
}))
app.use(express.urlencoded({
    limit: "50mb",
    extended: true
}))

app.use(route)

app.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`);
})