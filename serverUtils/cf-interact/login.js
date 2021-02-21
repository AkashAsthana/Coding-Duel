const puppeteer = require("puppeteer");
// const credentials = require("../credentials.json");
require("dotenv").config();
const fs = require("fs");
var handle = process.env.handle;
var password = process.env.password;
const verdict = require("./verdict");
var sameCode = false;

// handle the situation when the code entered is the same as some old submission,
// the page won't redirect to submitted solutions page

async function waitForDuration(duration) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve("Nice");
    }, duration);
  });
}

async function login() {
  const browser = await puppeteer.launch({
    args: ["--disable-features=ImprovedCookieControls","--no-sandbox"],
    executablePath: "google-chrome",
      // "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });


  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
  );

  await page.goto("https://codeforces.com/enter");
  await page.type("#handleOrEmail", handle);
  await page.type("#password", password);
  await page.click(".submit");
  const cookiesObject = await page.cookies();
  fs.writeFileSync("userCookies.json", JSON.stringify(cookiesObject));
  await page.waitForNavigation();
  await page.screenshot({ path: "login.png" });
  await browser.close();
}

async function submit(userCode, problemCode, language) {
  var map = {};
  map["cpp"] = "cpp";
  map["java"] = "java";
  map["python3"] = "py";
  // const extension =
  console.log("file : ", map[language]);
  fs.writeFileSync("./userCode." + map[language], userCode);

  const browser = await puppeteer.launch({
    //ignoreDefaultArgs: true,
    args: ["--disable-features=ImprovedCookieControls","--no-sandbox"],
    executablePath:
    "google-chrome",
      // "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();

  // loading user cookies in current session
  const savedCookies = fs.readFileSync("userCookies.json");
  const parsedCookies = JSON.parse(savedCookies);
  if (parsedCookies !== 0) {
    for (var cookie of parsedCookies) await page.setCookie(cookie);
  }
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
  );

  await page.goto("https://codeforces.com/problemset/submit");

  await page.waitForSelector("input[type=file]");
  await page.waitForSelector("input[name=submittedProblemCode]");
  await page.waitForSelector("select[name=programTypeId]");
  await page.waitForSelector("input[type=submit]");
  waitForDuration(1000);
  await page.type("input[name=submittedProblemCode]", problemCode);
  await page.screenshot({ path: "afterProblemCode.png" });
  switch (language) {
    case "cpp":
      await page.select("select[name=programTypeId]", "54");
      break;
    case "java":
      await page.select("select[name=programTypeId]", "36");
      break;
    case "python3":
      await page.select("select[name=programTypeId]", "31");
      break;
  }

  const inputUploadHandle = await page.$("input[type=file]");
  let fileToUpload = "./userCode." + map[language];
  inputUploadHandle.uploadFile(fileToUpload);

  await page.screenshot({ path: "afterSolution.png" });

  await page.click("input[type=submit]");
  waitForDuration(2000);
  // await page.evaluate(() => {
  //   let el = document.getElementsByClassName("for__source");
  //   if(el!==null && el!==undefined){
  //     sameCode=true;
  //   }
  // })
  // const error = await page.select('for__source');
  // if(error !== null && error !== undefined){
  //   sameCode=true;
  //   return;
  // }
  await page.screenshot({ path: "afterClickingSubmit.png" });

  waitForDuration(3000);

  await browser.close();
}

async function submitToCF(userCode, problemCode, language) {
  await login();
  console.log("language received by submitToCF api : ", language);
  await submit(userCode, problemCode, language);
  if(sameCode===true){
    return "You have submitted exactly the same code before";
  }
  const submissionVerdict = await verdict();
  console.log("Verdict came : ", submissionVerdict);
  return submissionVerdict;
}

// submitToCF();

module.exports = submitToCF;
