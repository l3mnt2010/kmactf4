const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("node:crypto");
const session = require("express-session");
const fs = require("fs");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    info: { type: Object },
    collectInfo: { type: Object },
  })
);

class Res {
  constructor(ok, message, data) {
    this.ok = ok;
    this.message = message;
    this.data = data;
  }
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

const app = express();
app.use(express.json());
app.use(
  session({
    secret: crypto.randomBytes(50).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 15 },
  })
);

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);
let {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  NODE_LOCAL_PORT
} = process.env;
NODE_LOCAL_PORT = parseInt(NODE_LOCAL_PORT)
const mongoDB = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
console.log(mongoDB);
main().catch((err) => {
  console.log(err);
  process.exit();
});
async function main() {
  await mongoose.connect(mongoDB);
}

app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (req?.session?.username) {
    let storyNumber = req.query.story;
    if (typeof storyNumber === "string" && /^[0-9]+$/.test(storyNumber)) {
      storyNumber = parseInt(storyNumber);
    } else {
      storyNumber = 1;
    }
    let fileName = path.join(__dirname, `stories/${storyNumber}.html`);
    try {
      if (fs.existsSync(fileName)) {
        res.sendFile(fileName);
      } else {
        res.status(500).json(new Res(false, "Đã có lỗi xảy ra", null));
      }
    } catch (err) {
      res.status(500).json(new Res(false, "Đã có lỗi xảy ra", null));
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) => {
  if (
    req?.body?.username &&
    req?.body?.password &&
    typeof req?.body?.username === "string" &&
    typeof req?.body?.password === "string"
  ) {
    User.findOne({
      username: String(req.body.username),
    })
      .then((user) => {
        if (user) {
          res
            .status(400)
            .send(
              new Res(
                false,
                "Đăng ký thất bại. Tên đăng nhập đã tồn tại!",
                null
              )
            );
        } else {
          let user = new User({
            username: String(req.body.username),
            password: sha256(String(req.body?.password)),
            info: req.body?.info,
            collectInfo: {
              key: String(req.body?.collectInfo?.key),
              value: String(req.body?.collectInfo?.value),
            },
          });
          user
            .save()
            .then(() => {
              res.status(200).send(new Res(true, "Đăng ký thành công", null));
            })
            .catch(() => {
              res.status(500).json(new Res(false, "Đã có lỗi xảy ra", null));
            });
        }
      })
      .catch(() => {
        res.status(500).send(new Res(false, "Đã có lỗi xảy ra", null));
      });
  } else {
    res.status(400).json(new Res(false, "Thông tin không hợp lệ", null));
  }
});

app.get("/login", (req, res) => {
  if (req?.session?.username) {
    res.redirect("/");
  } else {
    res.sendFile("login.html", { root: __dirname + "/public/html" });
  }
});

app.post("/login", (req, res) => {
  if (
    req?.body?.username &&
    req?.body?.password &&
    typeof req?.body?.username === "string" &&
    typeof req?.body?.password === "string"
  ) {
    User.findOne(
      {
        username: String(req.body.username),
        password: sha256(String(req.body?.password)),
      },
      { _id: false, username: true, info: true }
    )
      .then((user) => {
        if (user) {
          req.session.username = user?.username;
          res.status(200).json(new Res(true, "Đâng nhập thành công", user));
        } else {
          res
            .status(400)
            .json(new Res(false, "Sai tên đăng nhập hoặc mật khẩu", null));
        }
      })
      .catch(() => {
        res.status(500).send(new Res(false, "Đã có lỗi xảy ra", null));
      });
  } else {
    res.status(400).json(new Res(false, "Thông tin không hợp lệ", null));
  }
});

app.post("/collect-info", (req, res) => {
  if (req?.session?.username) {
    User.findOneAndUpdate(
      { username: req?.session?.username },
      {
        $rename: {
          "collectInfo.key": String(req?.body?.key),
          "collectInfo.value": String(req?.body?.value),
        },
      }
    )
      .then(() => {
        res.status(200).json(new Res(true, null));
      })
      .catch(() => {
        res.status(500).json(new Res(false, "Đã có lỗi xảy ra", null));
      });
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  if (req?.session) {
    req.session.destroy();
  }
  res.redirect("/login");
});

app.listen(NODE_LOCAL_PORT, () => {
  console.log(`App listening on port ${NODE_LOCAL_PORT}`);
});
