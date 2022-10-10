#!/usr/bin/env node

"use strict";

var util = require('util');
var path = require('path');
var http = require('http');

var express = require('express');
var sqlite3 = require('sqlite3');

var app = express()

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

var httpserv = http.createServer(app)
main()


function main() {
    defineRoutes()
    httpserv.listen(HTTP_POTH)
    console.log(`Listening on http://localhost:${HTTP_POTH}...`);
}

function defineRoutes() {
    app.get("/get-records", async (req, res) => {
        await delay(1000)
        var records = await getAllRecors()
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        })
        res.end(JSON.stringify(records))
    })

    app.use((req, res, next) => {

        if (/^\/(?:index\/?)?(?:[?#].*$)?$/.test(req.url)) {
            req.url = "/index.html";
        }
        else if (/^\/js\/.+$/.test(req.url)) {
            next();
            return;
        }
        else if (/^\/(?:[\w\d]+)(?:[\/?#].*$)?$/.test(req.url)) {
            let [, basename] = req.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);
            req.url = `${basename}.html`;
        }
        else {
            req.url = "/404.html"
        }

        next();
    })

    app.use(express.static(WEB_PATH, {
        maxAge: 100,
        setHeaders: function setHeaders(res) {
            res.setHeader("Server", "Node Workshop: ex6")
        }
    }))
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





// var fileServer = new staticAlias.Server(WEB_PATH, {
//     cache: 100,
//      serverInfo: "Node workshop: ex5",
//     alia s: [

//     ],
// })


// async function handelRequest(req, res) {
//     if (req.url == "/get-records") {
//         await delay(1000)
//         let records = await getAllRecors()



//     }
//     else {
//         fileServer.serve(req, res)
//     }
//     fileServer.serve(req, res)
// }


