"use strict";

var util = require('util');
var path = require('path');
var http = require('http');

var sqlite3 = require('sqlite3');
var staticAlias = require('node-static-alias');

const DB_PATH = path.join(__dirname, "my.db");
const WEB_PATH = path.join(__dirname, "web");
const HTTP_POTH = 8039

var delay = util.promisify(setTimeout)
var myDB = new sqlite3.Database(DB_PATH)
var SQL3 = {
    run(...args) {
        return new Promise((resolve, reject) => {
            myDB.run(...args, function onResult(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    },
    get: util.promisify(myDB.get.bind(myDB)),
    all: util.promisify(myDB.all.bind(myDB)),
    exec: util.promisify(myDB.exec.bind(myDB)),
}

var fileServer = new staticAlias.Server(WEB_PATH, {
    cache: 100,
    serverInfo: "Node workshop: ex5"
    alias: [

    ]
})

var httpserv = http.createServer(handelRequest)
main()

function main() {
    httpserv.listen(HTTP_POTH)
    console.log(`Listening on http://localhost:${HTTP_POTH}...`);
}

async function handelRequest(req, res) {
    if (req.url == "/hello") {
        res.writeHead(200, { "Content-type": "text/plain" })
        res.end("hello world")
    }
    else {
        res.writeHead(404)
        res.end
    }
}