require('dotenv').config();

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
const bodyParser = require("body-parser"); // 추가
const { createServer, build } = require("vite");
const ws = require("ws");
const fs = require("fs");
const mariadb = require('../database/connect/mariadb');
const conn = mariadb.conn;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // 추가
const { v4: uuidv4 } = require('uuid'); // uuid 패키지 임포트

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

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

console.log("JWT_SECRET:", JWT_SECRET);
console.log("REFRESH_SECRET:", REFRESH_SECRET);

const app = express();
app.use(bodyParser.json()); // 추가
app.use(cookieParser()); // 추가

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
            "cors": true, 
            "hmr": {
                "port": 20001
            }
        },
        "optimizeDeps": {
            "exclude": [
                "uuid",
                "xlsx",
                "jsonwebtoken",
                "jws"
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

//=================================================================
// Test Database Connection
//=================================================================

async function testDatabaseConnection() {
    try {
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM user");
        console.log("Database connection successful. Data from user table:");
        console.log(rows);
    } catch (err) {
        console.error("Database connection failed:", err);
    }
}

// Call the test function
testDatabaseConnection();



//=================================================================
// Login Endpoint
//=================================================================

function generateAccessToken(user) { // 엑세스 토큰 생성
    if (!user) return null;

    const u = {
        userId: user.user_id,
        name: user.name,
        username: user.team_name,
        isAdmin: user.role 
    };

    return jwt.sign(u, JWT_SECRET, {
        expiresIn: '7d'
    });
}

function generateRefreshToken(user) { // 리프레시 토큰 생성
    if (!user) return null;

    const u = {
        userId: user.user_id,
        name: user.name,
        username: user.team_name,
        isAdmin: user.role 
    };

    return jwt.sign(u, REFRESH_SECRET, {
        expiresIn: '30d'
    });
}

app.post('/login', async (req, res) => { // 로그인 요청 처리
    const { username, password } = req.body;

    try {
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM user WHERE email = ? AND pw = ?", [username, password]);

        if (rows.length > 0) {
            const user = rows[0];

            // 회원 상태 확인 
            if (user.state !== '정상') {
                return res.json({ success: false, message: '접근 거부. 관리자에게 문의하세요.' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // HttpOnly 속성을 제거하여 클라이언트 측에서 접근 가능하게 설정
            res.cookie('accessToken', accessToken, { secure: true });
            res.cookie('refreshToken', refreshToken, { secure: true });
            res.cookie('userRole', user.role, { secure: true });

            res.json({ success: true, userRole: user.role, name: user.name});
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/refreshToken', function (req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({
            error: true,
            message: "Refresh Token is required."
        });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, function (err, user) {
        if (err) return res.status(401).json({
            error: true,
            message: "Invalid Refresh Token."
        });

        // generate new access token
        const accessToken = generateAccessToken(user);
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        return res.json({ accessToken });
    });
});

//=================================================================
// User Profile Endpoint
//=================================================================
app.get('/api/user-profile', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM user WHERE user_id = ?", [decoded.userId]);

        if (rows.length > 0) {
            const user = rows[0];
            res.json({
                userId: user.user_id,
                name: user.name,
                username: user.team_name,
                isAdmin: user.role,
                profile_pic: user.profile_pic,
            });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Notice Data Endpoint
//=================================================================
async function fetchNoticeData() {
    try {
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM notice");
        console.log("Fetched notice data:\n", rows); // 데이터 출력
        return rows;
    } catch (err) {
        console.error("Failed to fetch data:", err);
        throw err;
    }
}

app.get('/api/notice-data', async (req, res) => {
const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const connection = await conn;
        const notices = await connection.query("SELECT * FROM notice");

        // 각 공지사항에 대해 사용자가 읽었는지 여부를 확인
        for (let notice of notices) {
            const [readRecord] = await connection.query(
                "SELECT * FROM NoticeRead WHERE notice_id = ? AND user_id = ?",
                [notice.notice_id, decoded.userId]
            );
            notice.isNew = !readRecord; // 읽은 기록이 없으면 새로운 공지사항
        }

        res.json(notices);
    } catch (err) {
        console.error("Error fetching notice data:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});
fetchNoticeData();

//=================================================================
// Notice Count Endpoint
//=================================================================

app.get('/api/notice-count', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const connection = await conn;
        const [result] = await connection.query("SELECT COUNT(*) as count FROM notice");
        console.log('Notice Count Result:', result); // 디버깅용 로그

        // BigInt 값을 문자열로 변환
        const count = result.count.toString();
        res.json({ count });
    } catch (err) {
        console.error("Error fetching notice count:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Schedule Data Endpoint
//=================================================================
app.get('/api/schedule', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const connection = await conn;
        const query = `
            SELECT * FROM schedule 
            WHERE user_id = ?
        `;
        const results = await connection.query(query, [decoded.userId]);
        console.log('Schedule Data:', results); // 디버깅용 로그

        res.json(results);
    } catch (err) {
        console.error("Error fetching schedule data:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Schedule Data Endpoint for Admin
//=================================================================
app.get('/api/schedule/all', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const connection = await conn;
        const query = `SELECT * FROM schedule`;
        const results = await connection.query(query);
        console.log('All Schedule Data:', results); // 디버깅용 로그

        // 각 스케줄의 foreman과 worker 컬럼을 사용하여 User 테이블에서 이름 조회
        for (let schedule of results) {
            const [foreman] = await connection.query("SELECT name FROM user WHERE user_id = ?", [schedule.foreman]);
            const [worker] = await connection.query("SELECT name FROM user WHERE user_id = ?", [schedule.worker]);
            schedule.foremanName = foreman ? foreman.name : 'Unknown';
            schedule.workerName = worker ? worker.name : 'Unknown';
        }
        console.log('All Schedule Data with Names:', results); // 디버깅용 로그

        res.json(results);
    } catch (err) {
        console.error("Error fetching all schedule data:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Logout Endpoint
//=================================================================

app.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('userRole');
    res.json({ success: true, message: '로그아웃 되었습니다.' });
});

//=================================================================
// Notice Detail Endpoint
//=================================================================
app.get('/api/notice-data/:noticeId', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const noticeId = req.params.noticeId;
        const connection = await conn;
        const [notice] = await connection.query("SELECT * FROM notice WHERE notice_id = ?", [noticeId]);

        if (notice) {
            res.json(notice);
        } else {
            res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error("Error fetching notice detail:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Notice Save Endpoint
//=================================================================
app.post('/api/notice', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token------:', decoded); // 디버깅용 로그

        const { importance, content } = req.body;
        const noticeId = uuidv4(); // UUID 생성
        const userId = decoded.userId;
        const createAt = new Date();
        const updatedAt = new Date();

        const connection = await conn;
        const query = `
            INSERT INTO Notice (notice_id, user_id, content, create_at, updated_at, importance)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [noticeId, userId, content, createAt, updatedAt, importance]);

        res.json({ success: true, message: '공지사항이 성공적으로 저장되었습니다.' });
    } catch (err) {
        console.error("Error saving notice:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Notice Read Endpoint
//=================================================================
app.post('/api/notice-read', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Tokennoticenoticenoticenotice:', decoded); // 디버깅용 로그

        const { noticeId } = req.body;
        const noticeReadId = uuidv4(); // UUID 생성
        const userId = decoded.userId;
        const readAt = new Date();

        const connection = await conn;
        const query = `
            INSERT INTO NoticeRead (notice_read_id, user_id, notice_id, read_at)
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(query, [noticeReadId, userId, noticeId, readAt]);

        res.json({ success: true, message: 'Notice read record successfully inserted.' });
    } catch (err) {
        console.error("Error inserting notice read record:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

//=================================================================
// Section Data by Area Name Endpoint
//=================================================================
app.get('/api/sections-by-area/:areaName', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        console.log('Decoded Token:', decoded); // 디버깅용 로그

        const areaName = req.params.areaName;
        const connection = await conn;

        // WorkingArea 테이블에서 area_name으로 area_id 조회
        const workingArea = await connection.query("SELECT area_id FROM WorkingArea WHERE area_name = ?", areaName);
        console.log('workingArea:', workingArea);

        if (!workingArea || workingArea.length === 0) {
            return res.status(404).json({ message: '해당 지역을 찾을 수 없습니다.' });
        }

        const areaId = workingArea[0].area_id;
        console.log('areaId:', areaId);

        // Section 테이블에서 area_id가 일치하는 모든 행 조회

        // const all = await connection.query("SELECT * FROM Section");
        // console.log('all:', all);

        const sections = await connection.query("SELECT * FROM Section WHERE area_id = ?", [areaId]);
        console.log('sections:', sections);

        res.json(sections);
    } catch (err) {
        console.error("Error fetching sections by area name:", err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/subsections/:sectionId', async (req, res) => {
    const { sectionId } = req.params;
    try {
        const connection = await conn;
        const rows = await connection.query('SELECT * FROM SubSection WHERE section_id = ?', [sectionId]);
        
        // 섹션 아이디가 같은 두 개의 항목을 반환하는지 확인하기 위해 콘솔 로그 추가
        console.log('Fetched SubSections:', rows);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching subsections:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


startServer();

