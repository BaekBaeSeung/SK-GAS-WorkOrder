/**
 *  @author XHI-NM <jeong.chiseo@tsp-xr.com>
 *  @description
 *  Multi Purpose Server using Node.js
 */

//=================================================================
// Import or Set Function from Node.js Packages
//=================================================================

// Load node.js package
// 필요한 패키지 추가하는 코드 
const express = require("express");
const cors = require("cors");
const { createServer, build } = require("vite");
const ws = require("ws");
const fs = require("fs");
const mariadb = require('../database/connect/mariadb');
const conn = mariadb.conn;


//=================================================================
// Set Server Configuration
//=================================================================

const IS_DEV = process.env.IS_DEV ? JSON.parse(process.env.IS_DEV) : false;
const IS_BUILD = process.env.IS_BUILD ? JSON.parse(process.env.IS_BUILD) : false;
const HTTP_PORT = process.env.PORT || 6080;
const HTTPS_PORT = process.env.HTTPS_PORT || 6443;
const HOST = process.env.HOST || '0.0.0.0';
const HTTPS_REDIRECT = true;
const SSL_KEY_PATH = "./ssl/_wildcard_.tsp-xr.com_key.pem";
const SSL_CERT_PATH = "./ssl/_wildcard_.tsp-xr.com_crt.pem";

const app = express();

const options = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
    passphrase: "",
    requestCert: false,
    rejectUnauthorized: false
};

//=================================================================
// Function & Class
//=================================================================

async function runViteBuild() {
    const buildConfig = {
        "root": `${__dirname}/../web/`,
        "outDir": `${__dirname}/../dist/`,
        "assetsInlineLimit": 0,
        "cssCodeSplit": true,
        "sourcemap": false,
        "minify": "esbuild"
    };

    await build(buildConfig);
}

async function createViteMiddleware(server) {
    const vite = await createServer({
        "root": `${__dirname}/../web/`,
        "server": {
            "host": true,
            "middlewareMode": true,
            "https": options,
            "strictPort": true,
            "appType": "custom",
            "cors": true, //주석
            "hmr": {
                "port": 20001
            }
        },
        "optimizeDeps": {
            "exclude": [
                // "three",
                // "@babylonjs/accessibility",
                // "@babylonjs/core",
                // "@babylonjs/gui",
                // "@babylonjs/gui-editor",
                // "@babylonjs/havok",
                // "@babylonjs/inspector",
                // "@babylonjs/ktx2decoder",
                // "@babylonjs/loaders",
                // "@babylonjs/materials",
                // "@babylonjs/node-editor",
                // "@babylonjs/node-geometry-editor",
                // "@babylonjs/post-processes",
                // "@babylonjs/procedural-textures",
                // "@babylonjs/serializers",
                // "@babylonjs/shared-ui-components",
                // "@babylonjs/viewer",
                // "@tweenjs/tween.js",
                // "uuid"
            ]
        },
        "clearScreen": false,
        "logLevel": "info" // info | warn | error | silent
    });

    return vite.middlewares;
}

function setServerOption(app) {
    app.set("view engine", "ejs");
    app.set("trust proxy", 1);
    app.engine("html", require("ejs").renderFile);

    app.use(cors());

    app.use((req, res, next) => {
        if (!IS_DEV) {
            res.header("Cross-Origin-Opener-Policy", "same-origin");
            res.header("Cross-Origin-Embedder-Policy", "require-corp");
        }
        
        if (HTTPS_REDIRECT) {
            const checkProto =  (!req.get("X-Forwarded-Proto") || req.get("X-Forwarded-Proto") !== "https");

            if (!req.secure && checkProto) {
                res.redirect(301, `https://${req.headers.host.split(":")[0]}:${HTTPS_PORT}${req.url}`);
            }
        }

        next();
    });
}

function setSrcRoute(server) {
    if (IS_DEV) {
        const wss = new ws.Server({ noServer: true });

        server.on("upgrade", (req, socket, head) => {
            if (req.url.startsWith("/@vite/ws")) {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit("connection", ws, req);
                });
            }
        });

        createViteMiddleware(server).then((middleware) => {
            app.use(middleware);
        });
    } else {
        app.use("/", express.static(`${__dirname}/../web/`));
    }
}

function startServer() {
    if (IS_BUILD) {
        runViteBuild();
    } else {
        setServerOption(app);

        const httpServer = require("http").createServer({}, app);
        const httpsServer = require("https").createServer(options, app);

        setSrcRoute(httpsServer);

        httpServer.listen(HTTP_PORT, HOST, () => {
            console.log("\n========================================================");
            console.log("Sample Server");
            console.log("========================================================");
            console.log("");
            console.log("### Server listening on port");
            console.log("");
            console.log(`- Network: http://${HOST}:${httpServer.address().port}`);
        });

        httpsServer.listen(HTTPS_PORT, HOST, () => {
            console.log(`- Network: https://${HOST}:${httpsServer.address().port}\n`);
        });
    }
}

startServer();