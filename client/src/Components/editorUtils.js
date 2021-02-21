//needs userCode, stdin
async function runCode(userCode, stdin, language, roomName, name) {
  if (userCode == null || userCode == undefined) {
    alert("NO program found.");
  } else {
    var userData = {
      code: userCode,
      stdin: stdin,
      language: language,
      roomName: roomName,
      username: name,
    };
    const output = await fetch("/compile", {
      method: "POST",
      body: JSON.stringify(userData),
    })
      .then((res) => res.text())
      .catch((e) => alert("Cannot run,try again"));
    return output;
  }
}

async function submitCode(userCode, problemCode, language, roomName, name) {
  if (userCode == null || userCode == undefined) {
    alert("NO program found.");
  } else {
    var userData = {
      userCode: userCode,
      problemCode: problemCode,
      language: language,
      roomName: roomName,
      username: name,
    };
    const output = await fetch("/submit", {
      method: "POST",
      body: JSON.stringify(userData),
    })
      .then((res) => res.text())
      .catch((e) => alert("Cannot submit,try again"));
    return output;
  }
}
const editorButtons = {
  runCode,
  submitCode
}
export default editorButtons;
