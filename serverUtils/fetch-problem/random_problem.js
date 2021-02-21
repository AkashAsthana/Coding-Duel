var request = require('request-promise');
// var methods = require('../methods.js')
var methods = require("./problemFetchUtils")
/*
Paste this script in head tag of html file to load MathJax library.

<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
*/

/*
Function which returns random problem according to difficulty assigned
*/

/*
This Below method returns JSON object having keys {
    questionDiv,
    questionInputTypeDiv,
    questionOutputTypeDiv,
    questionSampleTestCases,
    questionNotesDiv
}
*/

/*
questionDiv,questionInputTypeDiv and questionOutputTypeDiv return string with html code. And questionSampleTestCases
returns array of object having keys {
    input,
    output
}
*/

const randomProblem = (...difficulty) => {
    return new Promise((resolve, reject) => {
        const problemsUrl = 'https://codeforces.com/api/problemset.problems';
        request.get(problemsUrl,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66"
                }
            })
            .then((res) => {
                res = JSON.parse(res);
                if (res.status == 'OK') {

                    //Get problems which are in range of difficulty assigned
                    const validProblems = methods.getValidProblems(res, difficulty);
                    if (validProblems.length == 0) {
                        console.log('Sorry, No Problems Found');
                        return;
                    }

                    //Select random problem from valid problems
                    const selectedproblems = methods.selectRandomProblems(validProblems, difficulty[difficulty.length - 1]);
                    selectedproblems.sort((p1,p2) => p1.rating > p2.rating ? 1 :p1.rating < p2.rating ? -1 : 0)

                    /*
                    We have selected our problem, Now we have to get body and input, output and sample test cases
                    of our problem and return it.
                    */
                    var fetchedQuestions = [];
                    selectedproblems.forEach((selectedproblem) => {
                        methods.getBodyOfProblem(selectedproblem)
                            .then(Question => {

                                //This is the point where we are returning our question in JSON format.
                                fetchedQuestions.push({
                                    questionBody : Question,
                                    questionDetails : selectedproblem
                                });
                                if (fetchedQuestions.length === selectedproblems.length) {
                                    resolve(fetchedQuestions);
                                }
                            })
                            .catch(err => reject(err));
                    })

                } else {
                    reject(res.comment);
                }
            })
            .catch(err => reject(err));
    })
}

module.exports = {
    randomProblem
}

/*
'randomProblem' function takes input size 4.
    First two elements are for range of rating (eg. 1400 - 1700).
    Last two elements are range for index (eg. A - D).
    example of input : (1400,1700,'A','D')
*/

//default difficulty input = (0,0,'a',a');