const express = require("express");
const path = require("path");
const Socket = require("websocket").server;
const http = require("http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./serverUtils/user-schema");
const cors = require("cors");
const randomProblem = require("./serverUtils/fetch-problem/random_problem").randomProblem;
const compile = require("./serverUtils/compilerAPI/main.js");
const submitToCf = require("./serverUtils/cf-interact/login");
require("dotenv").config();
const dbUri = process.env.MONGO_ATLAS_URI;
// const publicPath = path.join(__dirname +".."+ "public");
const port = process.env.PORT || 4000;
//==========================================================

var rooms = [];

var app = express();
// app.use(express.static(publicPath));

mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    server.listen(port, () => console.log(`Server running on ${port}`))
  )
  .catch((err) => console.log(err));

// =============MIDDLEWARES============================
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});


// if (process.env.NODE_ENV === 'production') {
//   // Serve any static files
//   app.use(express.static(path.join(__dirname, 'client/build')));
// // Handle React routing, return all requests to React app
//   app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.text());
app.use(cors());

let server = http.createServer(app);

// ==========ROUTES=============================================

app.get("/check", authenticateToken, (req, res) => {
  console.log('checking..')
  res.send(true);
});

app.post("/login", async (req, res) => {
  User.findOne({ username: req.body.username })
    .then(async (user) => {
      if (!user) {
        res.status(400).json({
          msg: "No user found",
          login: false,
        });
      }
      try {
        if (await bcrypt.compare(req.body.password, user.password)) {
          const foundUser = { username: user.username };
          const accessToken = jwt.sign(foundUser, process.env.TOKEN_SECRET);
          res.json({
            accessToken: accessToken,
            login: true,
          });
        } else {
          res.status(400).json({
            msg: "wrong password",
            login: false,
          });
        }
      } catch {
        res.status(500).json({
          msg: "Some error Occured",
          login: false,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: err,
        login: false,
      });
    });
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    user
      .save()
      .then(() => {
        res.json({
          Registered: user,
        });
      })
      .catch((err) =>
        res.json({
          msg: err,
        })
      );
  } catch {
    res.json({
      msg: "Cannot register Please try again later",
    });
  }
});

app.post("/submit", cors(), async (req, res, next) => {
  var parsedRequest = JSON.parse(req.body);
  console.log("language received by server : ", parsedRequest.language);
  var data;
  try{
    data = await submitToCf(
      parsedRequest.userCode,
      parsedRequest.problemCode,
      parsedRequest.language
    );
  }catch(err){
    console.log(err)
    res.send(JSON.stringify({
      virdict:"cannot submit, server error"
    }))
  }

  // sending activities
  const activity = {
    runOrSubmit: "submit",
    roomName: parsedRequest.roomName,
    username: parsedRequest.username,
  };
  sendActivity(activity);

  console.log("DATA::", data);
  if (data == "OK") {
    res.send(
      JSON.stringify({
        verdict: data,
        points: 10,
      })
    );
  } else {
    res.send(
      JSON.stringify({
        verdict: data,
      })
    );
  }
});

app.post("/compile", cors(), async (req, res, next) => {
  var parsedRequest = JSON.parse(req.body);
  const data = await compile(
    parsedRequest.code,
    parsedRequest.stdin,
    parsedRequest.language
  );

  // sending activities
  const activity = {
    runOrSubmit: "run",
    roomName: parsedRequest.roomName,
    username: parsedRequest.username,
  };
  sendActivity(activity);

  console.log(data);
  res.send(data);
});

if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  app.use(express.static(path.join(__dirname,'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'client/build','index.html'));
  });
}

//===================AUTH============================

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.send(false);
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.send(false);
    }
    req.user = user;
    next();
  });
}

// ===========SOCKETS==================================

const webSocket = new Socket({ httpServer: server });
let users = [];
webSocket.on("request", async (req) => {
  const connection = req.accept();

  connection.on("message", async (message) => {
    const data = await JSON.parse(message.utf8Data);
    const user = findUser(data.username);

    switch (data.type) {
      case "store_user":
        if (user != null) {
          return;
        }
        const username = data.username;
        const newUser = {
          conn: connection,
          username: username,
        };

        users.push(newUser);
        break;
      case "store_offer":
        if (user == null) return;
        user.offer = data.offer;
        break;

      case "store_candidate":
        if (user == null) {
          return;
        }
        if (user.candidates == null) user.candidates = [];

        user.candidates.push(data.candidate);
        break;
      case "send_answer":
        if (user == null) {
          return;
        }

        sendData(
          {
            type: "answer",
            answer: data.answer,
          },
          user.conn
        );
        break;
      case "send_candidate":
        if (user == null) {
          return;
        }

        sendData(
          {
            from: "receiver",
            type: "candidate",
            candidate: data.candidate,
          },
          user.conn
        );
        break;
      case "join_call":
        if (user == null) {
          return;
        }

        sendData(
          {
            type: "offer",
            offer: user.offer,
          },
          connection
        );

        user.candidates.forEach((candidate) => {
          sendData(
            {
              from: "sender",
              type: "candidate",
              candidate: candidate,
            },
            connection
          );
        });

        break;

      case "get_Question":
        console.log("getting questions ..");
        console.log(data);
        var roomIndex = await getRoomIndex(data.roomName);

        // setting  user connections for page3 interactions for sending activities
        if (
          rooms[roomIndex].ConnForActivities === undefined ||
          rooms[roomIndex].ConnForActivities === null
        ) {
          rooms[roomIndex].ConnForActivities = [];
          rooms[roomIndex].ConnForActivities.push(connection);
        } else {
          rooms[roomIndex].ConnForActivities.push(connection);
        }

        console.log("roomIndex : ", roomIndex);
        const time = rooms[roomIndex].time;
        var questions = JSON.stringify({
          problems: rooms[roomIndex].problems,
          time: time,
        });
        connection.send(questions);
        break;

      // newly added
      case "create_room":
        console.log("Came in create room");
        handleCreateRoom(connection, data);
        break;

      case "message":
        var RI = await getRoomIndex(data.roomName);
        const len = rooms[RI].ConnForActivities.length
        rooms[RI].ConnForActivities[len-2].send(
          JSON.stringify({
            type: "message",
            name: data.name,
            msg: data.msg,
          })
        );
        rooms[RI].ConnForActivities[len-1].send(
          JSON.stringify({
            type: "message",
            name: data.name,
            msg: data.msg,
          })
        );
        break;

      case "Apply_filter":
        await applyFilters(data);
        connection.send("Applied!");
        break;

      case "store_score":
        console.log("storing score..");
        console.log("roomName : ", data.roomName);
        roomIndex = await getRoomIndex(data.roomName);
        console.log("roomIndex : ", roomIndex);
        if (roomIndex !== undefined) {
          console.log("points storing is : ", data.score);
          if (rooms[roomIndex].user1 == data.name) {
            rooms[roomIndex].user1Score = data.score;
            console.log("score saved1!");
            console.log(rooms[roomIndex]);
          } else {
            rooms[roomIndex].user2.score = data.score;
            console.log("score saved2!");
            console.log(rooms[roomIndex]);
          }
          const len = rooms[roomIndex].ConnForActivities.length;
          rooms[roomIndex].ConnForActivities[len - 2].send(
            JSON.stringify({
              type: "got_score",
              name: data.name,
              score: data.score,
            })
          );
          rooms[roomIndex].ConnForActivities[len - 1].send(
            JSON.stringify({
              type: "got_score",
              name: data.name,
              score: data.score,
            })
          );
        } else {
          console.log("cannot store");
        }
        break;

      case "get_score":
        console.log("getting score..,roomName : ", data.roomName);
        const rI = await getRoomIndex(data.roomName);
        console.log("room found : ", rI);
        if (rI == undefined) {
          connection.send(
            JSON.stringify({
              type: "score",
              score: {
                your: 0,
                opponent: 0,
              },
            })
          );
        } else {
          var score = {
            your: 0,
            opponent: 0,
          };
          if (rooms[rI].user1 == data.name) {
            if (rooms[rI].user1Score) {
              score.your = rooms[rI].user1Score;
            }
            if (rooms[rI].user2Score) {
              score.opponent = rooms[rI].user2Score;
            }
          } else {
            if (rooms[rI].user2Score) {
              score.your = rooms[rI].user2Score;
            }
            if (rooms[rI].user1Score) {
              score.opponent = rooms[rI].user1Score;
            }
          }
          console.log("found score: ", score);
          connection.send(
            JSON.stringify({
              type: "score",
              score: score,
            })
          );
        }

        break;
    }
  });

  connection.on("close", (reason, description) => {
    users.forEach((user) => {
      if (user.conn == connection) {
        users.splice(users.indexOf(user), 1);
        return;
      }
    });
  });
});

async function applyFilters(data) {
  roomIndex = await getRoomIndex(data.roomName);
  rooms[roomIndex].filters = data.filters;
  rooms[roomIndex].time = data.time;
  await getProblems(roomIndex);
}

function sendData(data, conn) {
  conn.send(JSON.stringify(data));
}

function findUser(username) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username == username) return users[i];
  }
}

async function handleCreateRoom(connection, data) {
  console.log("Room created", data);
  const roomExists = await checkIfRoomExists(data.roomName);
  var roomIndex = -1;
  if (roomExists) {
    // second user clicked ready
    console.log("room exist");
    roomIndex = await getRoomIndex(data.roomName);
    rooms[roomIndex].count++; // indicator of how many people in the room have pressed the "ready" button
    rooms[roomIndex].user2 = data.name;
    rooms[roomIndex].user2Conn = connection;
    rooms[roomIndex].user2Score = 0;
  } else {
    // first user clicked ready
    console.log("room does not exist");
    const room = new Object();
    room.roomName = data.roomName;
    room.count = 1; // indicator of how many people in the room have pressed the "ready" button
    room.user1 = data.name;
    room.user1Conn = connection;
    room.user1Score = 0;
    room.time = data.time;
    rooms.push(room);
    return;
  }
}

async function getProblems(roomIndex) {
  const payload = {
    minRating: rooms[roomIndex].filters.minDiff,
    maxRating: rooms[roomIndex].filters.maxDiff,
    minIndex: rooms[roomIndex].filters.minIndex,
    maxIndex: rooms[roomIndex].filters.maxIndex,
    numberOfProblems: rooms[roomIndex].filters.numProblems,
  };
  var fetchedProblems = await randomProblem(
    payload.minRating,
    payload.maxRating,
    payload.minIndex,
    payload.maxIndex,
    payload.numberOfProblems
  )
    .then((quest) => {
      return quest;
    })
    .catch((err) => console.log(err));
  console.log("Fetched roblems ");

  rooms[roomIndex].problems = fetchedProblems;
}

async function checkIfRoomExists(roomName) {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].roomName !== undefined && rooms[i].roomName === roomName)
      return true;
    if (i == rooms.length - 1) return false;
  }
  return false;
}
async function getRoomIndex(roomName) {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].roomName !== undefined && rooms[i].roomName === roomName)
      return i;
  }
}

async function sendActivity(data) {
  const roomName = data.roomName;
  const roomIndex = await getRoomIndex(roomName);
  const len = rooms[roomIndex].ConnForActivities.length;
  rooms[roomIndex].ConnForActivities[len - 2].send(
    JSON.stringify({
      type: "activity",
      runOrSubmit: data.runOrSubmit,
      username: data.username,
    })
  );
  rooms[roomIndex].ConnForActivities[len - 1].send(
    JSON.stringify({
      type: "activity",
      runOrSubmit: data.runOrSubmit,
      username: data.username,
    })
  );
}
