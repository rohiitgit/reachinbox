
import Imap from "imap";
import inspect from "util";
import dotenv from "dotenv";
dotenv.config();


const imap = new Imap({
  user: process.env.IMAP_USER_1,
  password: process.env.IMAP_PASSWORD_1,
  host: process.env.IMAP_HOST_1,
  port: parseInt(process.env.IMAP_PORT_1),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }, // <--- add this line
});


imap.once("ready", function () {
  console.log("✅ IMAP connection successful!");
  imap.end();
});

imap.once("error", function (err) {
  console.error("❌ Connection error:", err);
});

imap.connect();
