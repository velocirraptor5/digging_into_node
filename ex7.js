#!/usr/bin/env node

"use strict";

var util = require('util');
var childProc = require("child_process")

const HTTP_POTH = 8039
const MAX_CHILDREN = 5

var delay = util.promisify(setTimeout)

main().catch(console.error())

async function main() {
    console.log(`Listening on http://localhost:${HTTP_POTH}...`);

    while (true) {
        process.stdout.write(`Sending ${MAX_CHILDREN} requests..`)

        let children = []

        for (let i = 0; i < MAX_CHILDREN; i++) {
            children.push(
                childProc.spawn("node", ["ex7-child.js"])
            )
        }
        let resps = children.map(function wait(child) {
            return new Promise(function c(res) {
                child.on("exit", code => {
                    if (code === 0) res(true);
                    else res(false)
                })
            })
        })
        resps = await Promise.all(resps)

        if (resps.filter(Boolean).length == MAX_CHILDREN) {
            console.log("success!");
        }
        else {
            console.log("failures");
        }


        await delay(500)
    }



}