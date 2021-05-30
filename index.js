const express = require('express')
const app = express()
const PORT = 3001
const bodyParser = require("body-parser")
const swaggerJsdoc = require("./swagger.json")
const swaggerUi = require("swagger-ui-express")

const cors = require('cors')

const fs = require('fs')
const path = require('path')
const pathToFile = path.resolve("./data.json")

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

const getResources = () => JSON.parse(fs.readFileSync(pathToFile))

app.use(express.json())
// mulai link

app.get("/", (req, res) => {
    res.send("Hello World")
})

//list
app.get("/api/resources-list", (req, res) => {
    const resources = getResources()
    res.send(resources)
})

//get id
app.get("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const {id} = req.params
    const resource = resources.find((a) => a.id === id)
    res.send(resource)
    
})

app.patch("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const {id} = req.params
    const index = resources.findIndex(resource => resource.id === id)
    const activeResource  = resources.find(resource => resource.status === "active")

    if (resources[index].status === "complete") {
        return res.status(422).send("Cannot update because resource has been completed");
    } 
 
    resources[index] = req.body

    if (req.body.status === "active") {
        if (activeResource) {
            return res.status(422).send("There is active resource already")
        }

        resources[index].status = "active"
        resources[index].activationTime = new Date()
    }

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file")
        }
    })

    res.send("Data has been updated")
    
})

app.get("/api/activeresources", (req, res) => {
    const resources = getResources()
    const activeResource = resources.find(resource => resource.status === "active")
    res.send(activeResource)
    
})

app.get("/api/resources", (req, res) => {
    const resources = getResources()
    res.send(resources)
    
})

//post
app.post("/api/resources", (req, res) => {
    const resources = getResources()
    const resource = req.body

    resource.createdAt = new Date()
    resource.status = "inactive"
    resource.id = Date.now().toString()

    resources.push(resource)

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file")
        }
    })
    res.send(resources)
})

//delete
app.delete("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const {id} = req.params
    const resource = resources.find((resource) => resource.id === id)
    if (resource) {
        resources.splice(resources.indexOf(resource), 1);
        fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
            if (error) {
                return res.status(422).send("Cannot store data in the file")
            }
        })
        res.send(resources)
    } else {
        res.sendStatus(404)
    }

})

//tes doang
app.get("/api/test-slug/:slug", (req, res) => {
    const {slug} = req.params
    res.send(slug)
})


  
app.use(
"/api-docs",
swaggerUi.serve,
swaggerUi.setup(swaggerJsdoc)
);

app.listen(PORT, () => {
    console.log('server is listening on port: ' + PORT)
})