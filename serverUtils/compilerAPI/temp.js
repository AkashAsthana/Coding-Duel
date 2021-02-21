const fetch = require('node-fetch');
const fs = require('fs')
var myHeaders = new fetch.Headers();

myHeaders.append("Content-Type", "application/json; charset=UTF-8");

//var code = (fs.readFileSync("code.cpp")).toString('utf-8');
// var raw = {
//     clientId: "9584be04aacd0834625be2eb219030b9",
//     clientSecret: "829e046a54d4aa83f94d0c53a5da27c75925c200e2e5789e908ba1a875aa7861",
//     script: code,
//     language: "cpp",
//     versionIndex: "0"
// };
// var send = JSON.stringify(raw)
// var requestOptions = {
//     method: 'POST',
//     headers: myHeaders,
//     body: send,
//     redirect: 'follow'
// };

async function compilerAPI(userCode, stdin, language) {
    var raw = {
        clientId: "9584be04aacd0834625be2eb219030b9",
        clientSecret: "829e046a54d4aa83f94d0c53a5da27c75925c200e2e5789e908ba1a875aa7861",
        script: userCode,
        stdin: stdin,
        language: language,
        versionIndex: "0"
    };
    var send = await JSON.stringify(raw)

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: send,
        redirect: 'follow'
    };
    var data = await fetch("https://api.jdoodle.com/v1/execute", requestOptions)
        .then(response => response.text())
        .then(result => result)
        .catch(error => console.log('error', error));

    return data;
}


async function compile(userCode, stdin, language) {
    const result = await compilerAPI(userCode, stdin, language);
    var result_obj = await JSON.parse(result);
    //console.log("RESult : ", result_obj);

    if (result_obj.statusCode != 200) {
        return "Can't compile now, try again later";
    } else {
        return result_obj.output;
    }

}

//compile();

module.exports = compile;