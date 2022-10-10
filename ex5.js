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
    serverInfo: "Node workshop: ex5",
    alias: [
        {
            match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
            serve: "index.html",
            force: true,
        },
        {
            match: /^\/js\/.+$/,
            serve: "<% absPath %>",
            force: true,
        },
        {
            match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
            serve: function onMatch(params) {
                return `${params.basename}.html`;
            },
        },
        {
            match: /[^]/,
            serve: "404.html",
        },
    ],
})

var httpserv = http.createServer(handelRequest)
main()

function main() {
    httpserv.listen(HTTP_POTH)
    console.log(`Listening on http://localhost:${HTTP_POTH}...`);
}

async function handelRequest(req, res) {
    if (req.url == "/get-records") {
        await delay(1000)
        let records = await getAllRecors()

        res.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        })
        res.end(JSON.stringify(records))

    }
    else {
        fileServer.serve(req, res)
    }
    fileServer.serve(req, res)
}



async function getAllRecors() {
    var result = await SQL3.all(
        `
            SELECT
                Other.data as 'other',
                Something.data as 'something'
            FROM 
                Something JOIN Other
                ON (Something.otherID = Other.id)
            ORDER BY 
                Other.id DESC, Something.data ASC
        `
    )
    if (result && result.length > 0) {
        return result
    }
}
