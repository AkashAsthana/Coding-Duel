const url = "https://codeforces.com/api/user.status?handle=CodingDuel&from=1&count=1";
const fetch = require("node-fetch")
var count = 0;
async function func() {
    return new Promise(async function (resolve, reject) {
        const submission = await fetch(url);
        const data = await submission.json();
        if (!data.result[0].hasOwnProperty('verdict') || data.result[0].verdict == 'TESTING') {
            reject(data.result[0]);
        } else {
            console.log("virdict :     =====   "+data.result);
            resolve(data.result[0]);
        }
    })
}

function recurse() {
    return new Promise((resolve) => {
        func()
            .then((msg) => {
                // console.log(`Ho gya!! at count : ${count} `, msg);
                resolve(msg.verdict)
            })
            .catch((err) => {
                //console.log("Reject ", err);
                count++;
                resolve(recurse())
            })
    })
}

async function main() {
    console.log("BEFORE")
    const res = await recurse();
    console.log("AFTER")
    // console.log("Returned result: ", res);
    console.log("virdict of submission : ",res);
    console.log(res)
    return res;
}
// main()

module.exports = main;