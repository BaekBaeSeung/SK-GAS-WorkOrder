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
app.use(cookieParser()); // 추가
app.use(bodyParser.json()); // 추가


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

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // 필요한 경우 서버를 재시작하거나, 알림을 보냅니다.
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // 필요한 경우 서버를 재시작하거나, 알림을 보냅니다.
});

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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM user WHERE email = ? AND pw = ?", [username, password]);

        if (rows.length > 0) {
            const user = rows[0];

            if (user.state !== '정상') {
                res.json({ success: false, message: '접근 거부. 관리자에게 문의하세요.' });
                return;
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res.cookie('accessToken', accessToken, { secure: true });
            res.cookie('refreshToken', refreshToken, { secure: true });
            res.cookie('userRole', user.role, { secure: true });

            res.json({ success: true, userRole: user.role, name: user.name });
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

app.post('/refreshToken', function (req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400).json({
            error: true,
            message: "Refresh Token is required."
        });
        return;
    }

    jwt.verify(refreshToken, REFRESH_SECRET, function (err, user) {
        if (err) {
            res.status(401).json({
                error: true,
                message: "Invalid Refresh Token."
            });
            return;
        }

        // generate new access token
        const accessToken = generateAccessToken(user);
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.json({ accessToken });
    });
});

//=================================================================
// User Profile Endpoint
//=================================================================
app.get('/api/user-profile', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM user WHERE user_id = ?", [decoded.userId]);

        if (rows.length === 0) {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            return;
        }

        const user = rows[0];
        res.json({
            userId: user.user_id,
            name: user.name,
            username: user.team_name,
            isAdmin: user.role,
            profile_pic: user.profile_pic,
        });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Notice Data Endpoint
//=================================================================
async function fetchNoticeData() {
    try {
        const connection = await conn;
        const rows = await connection.query("SELECT * FROM notice");
        return rows;
    } catch (err) {
        console.error("Failed to fetch data:", err);
        throw err;
    }
}

app.get('/api/notice-data', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증

        const notices = await fetchNoticeData(); // fetchNoticeData 함수 사용

        const connection = await conn;
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
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Notice Count Endpoint
//=================================================================

app.get('/api/notice-count', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        jwt.verify(token, JWT_SECRET); // 토큰 검증만 수행

        const connection = await conn;
        const [result] = await connection.query("SELECT COUNT(*) as count FROM notice");

        // BigInt 값을 문자열로 변환
        const count = result.count.toString();
        res.json({ count });
    } catch (err) {
        console.error("Error fetching notice count:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Schedule Data Endpoint
//=================================================================
app.get('/api/schedule', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        
        const connection = await conn;
        const query = `
            SELECT * FROM schedule 
            WHERE user_id = ?
        `;
        const results = await connection.query(query, [decoded.userId]);
        
        res.json(results);
    } catch (err) {
        console.error("Error fetching schedule data:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Today's Schedule Data Endpoint
//=================================================================
app.get('/api/schedule/today', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        

        const connection = await conn;
        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const query = `
            SELECT * FROM schedule 
            WHERE user_id = ? AND DATE_FORMAT(create_at, '%Y-%m-%d') = ?
        `;
        const results = await connection.query(query, [decoded.userId, todayDateString]);
        

        res.json(results);
    } catch (err) {
        console.error("Error fetching today's schedule data:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Schedule Data Endpoint for Admin
//=================================================================
app.get('/api/schedule/all', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        

        const connection = await conn;
        const query = `SELECT * FROM schedule`;
        const results = await connection.query(query);
        

        // 각 스케줄의 foreman과 worker 컬럼을 사용하여 User 테이블에서 이름 조회
        for (let schedule of results) {
            const [foreman] = await connection.query("SELECT name FROM user WHERE user_id = ?", [schedule.foreman]);
            const [worker] = await connection.query("SELECT name FROM user WHERE user_id = ?", [schedule.worker]);
            schedule.foremanName = foreman ? foreman.name : 'Unknown';
            schedule.workerName = worker ? worker.name : 'Unknown';
        }
        

        if (!res.headersSent) {
            res.json(results);
        }
    } catch (err) {
        console.error("Error fetching all schedule data:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Logout Endpoint
//=================================================================

app.post('/logout', (req, res) => {
    try {
        res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'strict' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
        res.clearCookie('userRole', { httpOnly: true, secure: true, sameSite: 'strict' });
        
        if (!res.headersSent) {
            res.json({ success: true, message: '로그아웃 되었습니다.' });
        }
    } catch (err) {
        console.error("Error during logout:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: '로그아웃 중 오류가 발생했습니다.' });
        }
    }
});

//=================================================================
// Notice Detail Endpoint
//=================================================================
app.get('/api/notice-data/:noticeId', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증

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
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Notice Save Endpoint
//=================================================================
app.post('/api/notice', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증

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
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Notice Read Endpoint
//=================================================================
app.post('/api/notice-read', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증

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
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Section Data by Area Name Endpoint
//=================================================================
app.get('/api/sections-by-area/:areaName', async (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰 검증
        

        const areaName = req.params.areaName;
        const connection = await conn;

        // WorkingArea 테이블에서 area_name으로 area_id 조회
        const [workingArea] = await connection.query("SELECT area_id FROM WorkingArea WHERE area_name = ?", [areaName]);
        

        if (!workingArea) {
            res.status(404).json({ message: '해당 지역을 찾을 수 없습니다.' });
            return;
        }

        const areaId = workingArea.area_id;
    

        const sections = await connection.query("SELECT * FROM Section WHERE area_id = ?", [areaId]);
        

        res.json(sections);
    } catch (err) {
        console.error("Error fetching sections by area name:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// Subsections Endpoint
//=================================================================
app.get('/api/subsections/:sectionId', async (req, res) => {
    const { sectionId } = req.params;

    // 토큰 검증 (필요한 경우)
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ message: '토큰이 없습니다.' });
        return;
    }

    try {
        jwt.verify(token, JWT_SECRET); // 토큰 검증

        const connection = await conn;
        const rows = await connection.query('SELECT * FROM SubSection WHERE section_id = ?', [sectionId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching subsections:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        } else if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

//=================================================================
// WorkingTime 데이터 조회 엔드포인트
//=================================================================
app.get('/api/working-time', async (req, res) => {
    const { time, area_name } = req.query;

    // 입력 유효성 검사
    if (!time || !area_name) {
        res.status(400).json({ message: '시간과 지역 이름이 필요합니다.' });
        return;
    }

    try {
        const connection = await conn;
        const query = `
            SELECT wt.work_time_id
            FROM WorkingTime wt
            JOIN WorkingArea wa ON wt.area_id = wa.area_id
            WHERE wt.time = ? AND wa.area_name = ?
        `;
        const results = await connection.query(query, [time, area_name]);

        res.json(results);
    } catch (err) {
        console.error('Error fetching working time data:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

//=================================================================
// WorkingDetail 데이터 인서트 엔드포인트
//=================================================================
// 서버의 시간대를 한국 시간으로 설정
process.env.TZ = 'Asia/Seoul';

app.post('/api/insertWorkingDetail', async (req, res) => {
    const { work_time_id, value, create_at, section, user_id, time, schedule_type } = req.body;


    // 입력 유효성 검사
    if (!work_time_id || !value || !create_at || !section || !user_id || !time || !schedule_type) {
        res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        return;
    }

    try {
        const connection = await conn;
        
        // create_at 값을 MariaDB에서 인식할 수 있는 형식으로 변환
        const date = new Date(create_at);
        const formattedCreateAt = date.toISOString().slice(0, 19).replace('T', ' ');

        // time 값을 HH:MM 형식으로 포맷팅
        const formattedTime = time.slice(0, 5);

        const query = `
            INSERT INTO WorkingDetail (working_detail_id, work_time_id, value, create_at, section, user_id, time, schedule_type)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [work_time_id, value, formattedCreateAt, section, user_id, formattedTime, schedule_type]);

        res.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
    } catch (err) {
        console.error('Error inserting working detail:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});
//=================================================================
// WorkingDetail 데이터 조회 엔드포인트
//=================================================================
app.get('/api/working-detail', async (req, res) => {
    const { section, user_id, time, schedule_type, date, isAdmin } = req.query;
    const decodedSection = decodeURIComponent(section);

    const [year, month, day] = date.split('. ').map(part => part.trim());
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    try {
        const connection = await conn;
        let query;
        let queryParams;

        if (isAdmin === 'ADMIN') {
            query = `
                SELECT *, CONVERT_TZ(create_at, '+00:00', '+09:00') as korea_time 
                FROM WorkingDetail
                WHERE DATE(CONVERT_TZ(create_at, '+00:00', '+09:00')) = ?
                AND section = ?
                AND time = ?
                AND schedule_type = ?
            `;
            queryParams = [formattedDate, decodedSection, time, schedule_type];
        } else {
            query = `
                SELECT *, CONVERT_TZ(create_at, '+00:00', '+09:00') as korea_time 
                FROM WorkingDetail
                WHERE DATE(CONVERT_TZ(create_at, '+00:00', '+09:00')) = ?
                AND section = ?
                AND user_id = ?
                AND time = ?
                AND schedule_type = ?
            `;
            queryParams = [formattedDate, decodedSection, user_id, time, schedule_type];
        }

        const results = await connection.query(query, queryParams);

        if (results.length > 0) {
            // 한국 시간으로 변환된 결과를 반환
            const result = results[0];
            result.create_at = result.korea_time;
            delete result.korea_time;
            return res.json(result);
        } else {
            if (!res.headersSent) {
                res.status(404).json({ message: '일치하는 데이터가 없습니다.' });
            }
        }
    } catch (err) {
        console.error('Error fetching working detail:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});
//=================================================================
// WorkingDetail 데이터 업데이트 엔드포인트
//=================================================================
app.put('/api/updateWorkingDetail', async (req, res) => {
    const { working_detail_id, value, section, user_id, time, schedule_type } = req.body;

    try {
        const connection = await conn;

        const query = `
            UPDATE WorkingDetail
            SET value = ?, section = ?, user_id = ?, time = ?, schedule_type = ?
            WHERE working_detail_id = ?
        `;
        const result = await connection.query(query, [value, section, user_id, time, schedule_type, working_detail_id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '데이터가 성공적으로 업데이트되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '업데이트할 데이터를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error('Error updating working detail:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: '서버 오류' });
        }
    }
});
//=================================================================
// Schedule Details Endpoint
//=================================================================
app.get('/api/schedule-details', async (req, res) => {
    const { area_name, schedule_type, time, sections, user_id, date, isAdmin } = req.query;

    let formattedDate;
    if (date) {
        try {
            const [year, month, day] = date.split('. ').map(part => part.trim());
            formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            formattedDate = new Date().toISOString().split('T')[0];  // 오늘 날짜를 기본값으로 사용
        }
    } else {
        formattedDate = new Date().toISOString().split('T')[0];  // 오늘 날짜를 기본값으로 사용
    }

    try {
        const connection = await conn;

        // WorkingArea 테이블에서 area_id 조회
        const areaQuery = 'SELECT area_id FROM WorkingArea WHERE area_name = ?';
        const [areaResult] = await connection.query(areaQuery, [area_name]);
        if (!areaResult) {
            res.status(404).json({ message: 'Area not found' });
            return;
        }
        const areaId = areaResult.area_id;

        // WorkingTime 테이블에서 work_time_id 조회
        const timeQuery = `
            SELECT work_time_id 
            FROM WorkingTime 
            WHERE area_id = ? AND schedule_type = ? AND time = ?
        `;
        const [timeResult] = await connection.query(timeQuery, [areaId, schedule_type, time]);
        if (!timeResult) {
            res.status(404).json({ message: 'Working time not found' });
            return;
        }
        const workTimeId = timeResult.work_time_id;

        // WorkingDetail 데이터 조회 쿼리
        let detailQuery;
        let queryParams;

        const sectionArray = sections ? sections.split(',') : [];

        if (isAdmin === 'ADMIN') {
            detailQuery = `
                SELECT *, CONVERT_TZ(create_at, '+00:00', '+09:00') as korea_time
                FROM WorkingDetail
                WHERE work_time_id = ? 
                AND section IN (?) 
                AND time = ? 
                AND schedule_type = ? 
                AND DATE(CONVERT_TZ(create_at, '+00:00', '+09:00')) = ?
            `;
            queryParams = [workTimeId, sectionArray, time, schedule_type, formattedDate];
        } else {
            detailQuery = `
                SELECT *, CONVERT_TZ(create_at, '+00:00', '+09:00') as korea_time
                FROM WorkingDetail
                WHERE work_time_id = ? 
                AND section IN (?) 
                AND user_id = ? 
                AND time = ? 
                AND schedule_type = ? 
                AND DATE(CONVERT_TZ(create_at, '+00:00', '+09:00')) = ?
            `;
            queryParams = [workTimeId, sectionArray, user_id, time, schedule_type, formattedDate];
        }

        const detailResults = await connection.query(detailQuery, queryParams);
        if (detailResults.length === 0) {
            res.status(404).json({ message: 'Working detail not found' });
            return;
        }

        // 결과를 한국 시간으로 변환
        const convertedResults = detailResults.map(result => {
            return {
                ...result,
                create_at: result.korea_time
            };
        });

        res.json({
            areaId,
            workTimeId,
            details: convertedResults
        });
    } catch (err) {
        console.error('Error fetching schedule details:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
});
//=================================================================
// WorkingTime 데이터 조회 엔드포인트 (모든 행 반환)
//=================================================================
app.get('/api/working-times', async (req, res) => {
    try {
        const connection = await conn;
        const results = await connection.query("SELECT * FROM WorkingTime");
        res.json(results);
    } catch (err) {
        console.error('Error fetching working times:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});
//=================================================================
// WorkingArea 데이터 조회 엔드포인트 (area_id로 조회)
//=================================================================
app.get('/api/working-area/:area_id', async (req, res) => {
    const { area_id } = req.params;
    try {
        const connection = await conn;
        const [result] = await connection.query("SELECT * FROM WorkingArea WHERE area_id = ?", [area_id]);
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Area not found' });
        }
    } catch (err) {
        console.error('Error fetching working area:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});

// 날짜 형식을 'YYYY-MM-DD HH:MM:SS'로 변환하는 함수
function formatDateToMySQL(date) {
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

//=================================================================
// Schedule 데이터 인서트 엔드포인트
//=================================================================
app.post('/api/insert-schedule', async (req, res) => {
    const { area_name, section, schedule_type, time, create_at, user_id, foreman, worker } = req.body;

    try {
        const connection = await conn;
        const formattedCreateAt = formatDateToMySQL(new Date(create_at));
        const query = `
            INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id, foreman, worker)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [area_name, section, schedule_type, time, formattedCreateAt, user_id, foreman, worker]);

        res.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
    } catch (err) {
        console.error('Error inserting schedule:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: '서버 오류' });
        }
    }
});
//=================================================================
// Foreman 데이터 조회 엔드포인트
//=================================================================
app.get('/api/foreman', async (req, res) => {
    try {
        const connection = await conn;
        const [result] = await connection.query("SELECT user_id FROM User WHERE role = 'ADMIN' LIMIT 1");
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Foreman not found' });
        }
    } catch (err) {
        console.error('Error fetching foreman:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: '서버 오류' });
        }
    }
});
//=================================================================
// 모든 섹션 조회 엔드포인트
//=================================================================
app.get('/api/all-sections', async (req, res) => {
    try {
        const connection = await conn;
        const query = 'SELECT DISTINCT section FROM Section';
        const results = await connection.query(query);

        const sections = results;
        res.json(sections);

    } catch (error) {
        console.error('Error fetching all sections:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/api/schedule-details-for-excel', async (req, res) => {
    const { area_name, schedule_type, time, date } = req.body;

    try {
        const connection = await conn;

        // WorkingArea 테이블에서 area_id 조회
        const [areaResult] = await connection.query('SELECT area_id FROM WorkingArea WHERE area_name = ?', [area_name]);
        if (!areaResult) {
            return res.status(404).json({ message: 'Area not found' });
        }
        const areaId = areaResult.area_id;

        // WorkingTime 테이블에서 work_time_id 조회
        const [timeResult] = await connection.query(
            'SELECT work_time_id FROM WorkingTime WHERE area_id = ? AND schedule_type = ? AND time = ?',
            [areaId, schedule_type, time]
        );
        if (!timeResult) {
            return res.status(404).json({ message: 'Working time not found' });
        }
        const workTimeId = timeResult.work_time_id;

        // 날짜에 9시간을 더해 한국 시간으로 조정
        const koreaDate = new Date(date);
        koreaDate.setHours(koreaDate.getHours() + 9);
        const adjustedDate = koreaDate.toISOString().split('T')[0];

        // WorkingDetail 데이터 조회 (날짜 조정)
        const detailQuery = `
            SELECT *
            FROM WorkingDetail
            WHERE work_time_id = ? AND DATE(create_at) = ?
        `;
        const detailResults = await connection.query(detailQuery, [workTimeId, adjustedDate]);
        console.log("detailResults : ",detailResults);
        console.log("workTimeId : ",workTimeId);
        console.log("adjustedDate : ",adjustedDate);

        // 결과의 create_at을 한국 시간으로 조정
        const convertedResults = detailResults.map(result => {
            const koreaTime = new Date(result.create_at);
            koreaTime.setHours(koreaTime.getHours() + 9);
            return {
                ...result,
                create_at: koreaTime
            };
        });

        res.json(convertedResults);
    } catch (err) {
        console.error('Error fetching schedule details for excel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


startServer();



