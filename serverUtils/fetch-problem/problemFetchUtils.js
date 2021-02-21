var request = require('request-promise').defaults({ encoding: 'UTF-8' });
const cheerio = require('cheerio');

var $ = '';
var counter = 0;

const getTotalQuestions = (res) => {
    $ = cheerio.load(res);
    const totalNumberOfQuestions = $("#pageContent > div.datatable > div:nth-child(6) > table > tbody tr").length - 1;
    $ = '';
    return totalNumberOfQuestions;
}

//Takes input as json object of problem details ans difficulty array and returns problems in range of difficulty level.
const getValidProblems = (res, difficulty) => {

    const minimumRating = difficulty[0];
    const maximumRating = difficulty[1];
    const minimumIndex = difficulty[2];
    const maximumIndex = difficulty[3];
    res = res.result.problems;
    const validProblems = res.filter(problem => problem.index >= minimumIndex && problem.index <= maximumIndex && problem.rating >= minimumRating && problem.rating <= maximumRating);
    return validProblems;
}

//Takes input as valid problems and return a random problem.Here problem means details of problem like contestId,rating,tags,points,etc.
const selectRandomProblems = (validProblems, noOfProblems) => {
    if (validProblems.length < noOfProblems) {
        return [];
    }
    const maxNumber = validProblems.length - 1;
    const minNumber = 0;
    var arrayOfRandomNumbers = [];
    var selectedproblems = [];
    while (arrayOfRandomNumbers.length < noOfProblems) {
        const randomIndex = Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
        if (arrayOfRandomNumbers.indexOf(randomIndex) === -1) {
            arrayOfRandomNumbers.push(randomIndex);
            selectedproblems.push(validProblems[randomIndex]);
        }
    }
    return selectedproblems;
}

const getProblemName = () => {
    return $("#pageContent > div.problemindexholder > div.ttypography > div > div.header > div.title").text();
}

//Replace the matched string with \( if match occur at odd-th time else \)
function replacingFunction() {
    counter++;
    if (counter % 2 == 1) {
        return '\\(';
    }
    return '\\)';
}

//Takes input as JSpath and returns the complete html of that tag.
const extractContent = (s) => {
    var extractedContent = '';
    $(s).each((index, element) => {
        extractedContent += $("<div />").append($(element).clone()).html()
    })
    counter = 0;
    extractedContent = extractedContent.split('$$$').join('$$')//.replace(/\$\$/g,replacingFunction);
    extractedContent = extractedContent.split('$$').join('$')// added this to process 'display expressions' as 'inline expressions'
    return extractedContent;
}

//This 'copy' function copies object.
const copy = (mainObj) => {
    let objCopy = {}; // objCopy will store a copy of the mainObj
    let key;

    for (key in mainObj) {
        objCopy[key] = mainObj[key]; // copies each property to the objCopy object
    }
    return objCopy;
}

//Takes input as JSpath where all inputs are available and return sample test cases
const extractSampleInput = (s) => {
    var sampleInputs = [];
    var obj = {
        'input': '',
        'output': ''
    };
    var count = 0;
    $(s).each((index, element) => {
        count++;
        if (count % 2 == 1) {
            var txt =  $(element).html();
            txt = txt.replace(/\n/g, "<br />");
            obj.input = txt;
        } else {
            var txt =  $(element).html();
            txt = txt.replace(/\n/g, "<br />");
            obj.output = txt;
            sampleInputs.push(copy(obj));
            obj.input = '';
            obj.output = '';
        }
    })
    return sampleInputs;
}

/*
This function is the soul function of this module. It returns the complete JSON object of the problem consisting of problem body,
input type body,output type body,array of objects which are sample test cases and Notes or Explanation.
*/
const getBodyOfProblem = (problem) => {
    return new Promise((resolve, reject) => {
        request.get(generateURL(problem.contestId, problem.index),
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66"
                }
            })
            .then(res => {
                $ = cheerio.load(res);
                const extractedName = getProblemName();
                const extractedBody = extractContent("#pageContent > div.problemindexholder > div.ttypography > div > div:nth-child(2)");
                const extractedInput = extractContent("#pageContent > div.problemindexholder > div.ttypography > div > div.input-specification");
                const extractedOutput = extractContent("#pageContent > div.problemindexholder > div.ttypography > div > div.output-specification");
                const extractedSampleTestCases = extractSampleInput("#pageContent > div.problemindexholder > div.ttypography > div > div.sample-tests > div.sample-test pre")
                const extractedNotes = extractContent("#pageContent > div.problemindexholder > div.ttypography > div > div.note");
                resolve({
                    'questionName': extractedName,
                    'questionDiv': extractedBody,
                    'questionInputTypeDiv': extractedInput,
                    'questionOutputTypeDiv': extractedOutput,
                    'questionSampleTestCases': extractedSampleTestCases,
                    'questionNotesDiv': extractedNotes
                })
            })
            .catch(err => {
                reject(err);
            });
    });
}

//Takes input as ID of contest and problem index or ID and returns the url.
const generateURL = (contestId, problemId) => {
    return `https://codeforces.com/contest/${contestId}/problem/${problemId}`;
}

module.exports = {
    getTotalQuestions,
    getValidProblems,
    selectRandomProblems,
    extractContent,
    copy,
    extractSampleInput,
    getBodyOfProblem,
    generateURL
}