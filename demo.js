// Dependencies
const fs = require("fs");
const crypto = require("crypto");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

// Globals
const API_TOKEN = process.env.API_TOKEN;
const API_SECRET = process.env.API_SECRET;
const API_URL = process.env.API_URL || "https://api.veriff.me/v1";
const WEBHOOK_PORT = process.env.WEBHOOK_PORT;
const IMAGE_DIR = process.env.IMAGE_DIR || "documents";

if (!API_TOKEN) throw "API_TOKEN environment variable is required";
if (!API_SECRET) throw "API_SECRET environment variable is required";

// Initialize
(async () => {
  try {
    const files = fs
      .readdirSync("./" + IMAGE_DIR)
      .filter((file) => file.match(/.*\.(jpg|jpeg|png)/gi));
    const session = await start();
    const verificationId = session.verification.id;

    const uploads = files.map(async (file) => {
      await upload(verificationId, file);
    });

    Promise.all(uploads).then(async () => {
      await end(verificationId);
      const media = await getMedia(verificationId);
    });
  } catch (err) {
    throw err;
  }
})();

async function start() {
  try {
    const payload = {
      verification: {
        person: {
          firstName: "Nican Onio",
          lastName: "Xander [EXAMPLE]",
          idNumber: "001-1505561-1",
        },
        document: {
          number: "VL0199336",
          type: "PASSPORT",
          country: "DO",
        },
        lang: "en",
        features: ["selfid"],
        timestamp: timestamp(),
      },
    };

    const headers = {
      "x-auth-client": API_TOKEN,
      "x-hmac-signature": generateSignature(payload, API_SECRET),
      "content-type": "application/json",
    };

    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };
    const response = await fetch(API_URL + "/sessions", options);
    return await response.json();
  } catch (err) {
    throw err;
  }
}

async function upload(verificationId, file) {
  try {
    const payload = {
      image: {
        context: file.split(".")[0],
        content: readImage(IMAGE_DIR + "/" + file),
        timestamp: timestamp(),
      },
    };

    const headers = {
      "x-auth-client": API_TOKEN,
      "x-hmac-signature": generateSignature(payload, API_SECRET),
      "content-type": "application/json",
    };

    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };
    const response = await fetch(
      API_URL + "/sessions/" + verificationId + "/media",
      options,
    );
    await response.json();
    return response;
  } catch (err) {
    throw err;
  }
}

async function getMedia(verificationId) {
  try {
    const headers = {
      "x-auth-client": API_TOKEN,
      "x-hmac-signature": generateSignature(verificationId, API_SECRET),
    };

    const options = { method: "GET", headers: headers };
    const response = await fetch(
      API_URL + "/sessions/" + verificationId + "/media",
      options,
    );
    return await response.json();
  } catch (err) {
    throw err;
  }
}

async function end(verificationId) {
  try {
    const payload = {
      verification: {
        frontState: "done",
        status: "submitted",
        timestamp: timestamp(),
      },
    };

    const headers = {
      "x-auth-client": API_TOKEN,
      "x-hmac-signature": generateSignature(payload, API_SECRET),
      "content-type": "application/json",
    };

    const options = {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(payload),
    };
    const response = await fetch(
      API_URL + "/sessions/" + verificationId,
      options,
    );
    return await response.json();
  } catch (err) {
    throw err;
  }
}

function timestamp() {
  return new Date().toISOString();
}

function readImage(file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

function generateSignature(payload, secret) {
  if (payload.constructor === Object) {
    payload = JSON.stringify(payload);
  }

  if (payload.constructor !== Buffer) {
    payload = Buffer.from(payload, "utf8");
  }

  const signature = crypto.createHmac("sha256", secret);
  signature.update(payload);
  return signature.digest("hex");
}

function isSignatureValid(data) {
  const { signature, secret } = data;
  let { payload } = data;

  if (data.payload.constructor === Object) {
    payload = JSON.stringify(data.payload);
  }
  if (payload.constructor !== Buffer) {
    payload = new Buffer.from(payload, "utf8");
  }
  const hash = crypto.createHmac("sha256", secret);
  hash.update(payload);
  const digest = hash.digest("hex");
  return digest === signature.toLowerCase();
}

// Receive a web hook locally
if (WEBHOOK_PORT) {
  const express = require("express");
  const app = express();
  app.use(bodyParser.json());
  let server = require("http").Server(app);

  app.post("/verification/", (req, res) => {
    const signature = req.get("x-hmac-signature");
    const secret = API_SECRET;
    const payload = req.body;
    isSignatureValid({ signature, secret, payload });
    res.json({ status: "success" });
    process.exit();
  });

  server.listen(WEBHOOK_PORT);
}
