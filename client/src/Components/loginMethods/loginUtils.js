require("dotenv").config();

const modalClick = () => {
  console.log("Clicked!");
};

const loginUtils = {
  async authenticate(callback, email, password) {
    const data = {
      username: email,
      password: password,
    };
    const payload = JSON.stringify(data);
    console.log("logging in...");
    var err = "";

    // server is running on port 4000
    // send data to login route
    const response = await fetch("/login", {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    })
      .then((res) => {
        // if 4** then wrong credentials
        if (res.status === 400 || res.status === 401) {
          err = "Wrong credentials";
          return res;
        } else {
          return res;
        }
      })
      .then((res) => res.json())
      .catch((error) => {
        err = error;
      });
    if (response && response.login === true) {
      try {
        localStorage.setItem("jwtToken", `${response.accessToken}`);
        callback(true);
        return;
      } catch (err) {
        // alert("Cannot set Token");
        callback(false, "Cannot set Token");
      }
    }
    callback(false, err);
  },
};
export default loginUtils;
