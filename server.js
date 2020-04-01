require("dotenv").config();

const express = require("express"),
  favicon = require("express-favicon"),
  session = require("express-session"),
  expressHandlebars = require("express-handlebars"),
  bodyParser = require("body-parser"),
  path = require("path"),
  fs = require("fs-extra"),
  pino = require("express-pino-logger")(),
  redis = require("redis"),
  https = require("https"),
  constants = require("constants"),
  helmet = require("helmet"),
  expectCt = require("expect-ct"),
  {
    v4: uuidv4
  } = require("uuid"),
  mailService = require("./services/mailService.js"),
  router = require("./routes"),
  server = express();

// clean folders before starting
fs.emptyDir(path.join(process.env.UPLOAD_PATH));
fs.emptyDir(path.join(process.env.DOWNLOAD_PATH));
fs.emptyDir(path.join(process.env.LOG_PATH));

mailService.openMailbox();

server.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// enable logging
server.use(pino);

// handlebars template engine
server.set("viewDir", "views");
server.engine(
  "html",
  expressHandlebars({
    extname: "html",
    partialsDir: "views/partials",
    defaultLayout: null
  })
);
server.set("view engine", "html");

// static hosting of public folder
server.use(express.static("public"));
server.use(favicon(__dirname + '/public/images/squanchy.png'));

// set secure headers
server.use((req, res, next) => {
  res.locals.nonce = uuidv4();
  next();
});

server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: [(req, res) => `'nonce-${res.locals.nonce}'`],
        scriptSrc: [(req, res) => `'nonce-${res.locals.nonce}'`],
        objectSrc: [(req, res) => `'nonce-${res.locals.nonce}'`],
        upgradeInsecureRequests: true
      }
    },
    referrerPolicy: {
      policy: "same-origin"
    }
  })
);

server.use(
  expectCt({
    enforce: process.env.CT_ENFORCE,
    maxAge: 30,
    reportUri: process.env.CT_REPORT_URI
  })
);

let sessionOptions = {
  genid: function (req) {
    return uuidv4();
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: null
  }
};

if (server.get("env") === "production") {
  let RedisStore = require("connect-redis")(session);
  let redisClient = redis.createClient();
  sessionOptions.store = new RedisStore({
    client: redisClient,
    url: process.env.REDIS_URL
  });
}

server.use(session(sessionOptions));

server.use("/", router);

// tls
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, "utf8"),
  certificate = fs.readFileSync(process.env.CERT, "utf8");
ca = fs.readFileSync(process.env.CA, "utf8");
(options = {
  key: privateKey,
  cert: certificate,
  ca: ca,
  secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
  honorCipherOrder: true
}),
(httpsServer = https.createServer(options, server));

httpsServer.listen(process.env.PORT || process.argv[2] || 8000, () => {
  console.log("HTTPS Server running on port " + (process.env.PORT || process.argv[2] || 8000));
});