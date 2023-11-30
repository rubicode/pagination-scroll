const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');
const { readFile } = require('node:fs/promises');
const path = require('path')

async function main() {
    const url = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db('datadb');
    const collection = db.collection('siswa');
    return collection;
}

main().then((siswa) => {
    const app = express()

    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.get('/', async function (req, res) {
        try {
            let { page = 1, limit = 10 } = req.query
            limit = Number(limit)
            page = Number(page)

            const offset = (page - 1) * limit

            const total = await siswa.countDocuments();
            const pages = Math.ceil(total / limit);
            const data = await siswa.find().limit(limit).skip(offset).toArray();
            res.json({
                data,
                page,
                pages,
                total
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({ err: err.message })
        }
    })

    app.get('/common', function(req, res){
        res.render('common')
    })

    app.get('/jquery', function(req, res){
        res.render('jquery')
    })

    app.get('/react', function(req, res){
        res.render('react')
    })

    app.get('/seed', async function (req, res) {
        function makeid(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }

        const data = []
        for (let i = 0; i < 100; i++) {
            data.push({ nama: makeid(Math.floor(Math.random() * 9) + 1) })
        }
        await siswa.insertMany(data)
        res.send(data)
    })

    app.listen(3001, function () {
        console.log("server jalan")
    })
}).catch((err) => {
    console.log(err)
})






