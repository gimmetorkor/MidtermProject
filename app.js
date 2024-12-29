const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3500;
var session = require("express-session");
var bodyParser = require("body-parser");
var mysql = require("mysql");
const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File to store the visit count and IP logs
const counterFile = path.join(__dirname, 'counter.txt');
const ipLogFile = path.join(__dirname, 'ip_log.json');

app.use(express.static(path.join(__dirname, "/public")));

// Read or initialize the visit count
let visitCount = 0;
if (fs.existsSync(counterFile)) {
    const fileData = fs.readFileSync(counterFile, 'utf-8');
    visitCount = parseInt(fileData, 10) || 0;
}

// Read or initialize the IP log (for tracking IP addresses and timestamps)
let ipLogs = {};
if (fs.existsSync(ipLogFile)) {
    ipLogs = JSON.parse(fs.readFileSync(ipLogFile, 'utf-8'));
}

// Function to check if an IP should be counted (within 24 hours)
const shouldCountVisit = (ip) => {
    const currentTime = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (!ipLogs[ip]) {
        // If IP is not logged, allow counting
        return true;
    } else {
        const lastVisitTime = ipLogs[ip];
        if (currentTime - lastVisitTime >= oneDay) {
            // If more than 24 hours have passed, allow counting
            return true;
        }
    }
    return false;
};

// API endpoint to get the current visit count
app.get('/api/visits', (req, res) => {
    const userIP = req.ip;

    // Check if the IP address has visited within the last 24 hours
    if (shouldCountVisit(userIP)) {
        // Increment the visit count
        visitCount++;

        // Update the visit count in the file
        fs.writeFileSync(counterFile, visitCount.toString());

        // Log the current IP and timestamp
        ipLogs[userIP] = Date.now();
        fs.writeFileSync(ipLogFile, JSON.stringify(ipLogs));
    }

    // Send the current visit count as the response
    res.json({ visitCount });
    
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


//2.connect database
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cybercrime"
});

connection.connect(function(err) {
    if (err) {
        console.error('Database connection error: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + connection.threadId);
});


//3. view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'ejs');

//4. change secret code
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/login", function(request, response){
    response.sendFile(path.join(__dirname, "/public/login.html"));
});


app.post("/auth", function(request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if (username && password) {
        connection.query("SELECT * FROM member WHERE username = ?", [username], function(error, results) {
            if (error) {
                console.error("Database error:", error);
                return response.status(500).send("เกิดข้อผิดพลาดของฐานข้อมูล");
            }

            if (results.length > 0) {
                const hashedPassword = results[0].password;

                // ตรวจสอบรหัสผ่านที่ผู้ใช้กรอกเทียบกับรหัสผ่านที่เข้ารหัสในฐานข้อมูล
                bcrypt.compare(password, hashedPassword, function(err, isMatch) {
                    if (err) {
                        console.error("Password comparison error:", err);
                        return response.status(500).send("เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน");
                    }

                    if (isMatch) {
                        request.session.loggedin = true;
                        request.session.username = username;
                        response.redirect("/index.html?username=" + username); // เข้าสู่ระบบสำเร็จ
                    } else {
                        response.send(`
                            <script>
                                alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                                window.location.href = "/login";
                            </script>
                        `);
                    }
                });
            } else {
                response.send(`
                    <script>
                        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                        window.location.href = "/login";
                    </script>
                `);
            }
        });
    } else {
        response.send(`
            <script>
                alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
                window.location.href = "/login";
            </script>
        `);
    }
});


const isAuthenticated = (req, res, next) => {
    if (req.session.loggedin) { 
        next();
    } else {
        res.redirect('/login');
    }
};


// เส้นทางดึงข้อมูลผู้ใช้
app.get('/getUser', (req, res) => {
    if (req.session.loggedin) {
        // ส่งข้อมูลผู้ใช้ถ้าล็อกอินแล้ว
        res.json({
            loggedin: true,
            username: req.session.username
        });
    } else {
        // ถ้ายังไม่ล็อกอิน ส่งกลับไปว่าเป็น Guest
        res.json({
            loggedin: false,
            username: null
        });
    }
});

// ตรวจสอบการล็อกอินก่อนเข้าถึงหน้าแรก
app.get('/', isAuthenticated, (req, res) => {
    res.redirect('/index'); // ถ้าเข้าสู่ระบบแล้วให้ไปที่หน้า /index
});


app.get("/index", function(request, response){
    response.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get('/about', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/about.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(err.status || 500).end();
        }
    });
});

app.get('/province', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/province.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(err.status || 500).end();
        }
    });
});

app.get('/report', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/report.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(err.status || 500).end();
        }
    });
});

app.get('/news', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/news.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(err.status || 500).end();
        }
    });
});

app.get('/contact', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/contact.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(err.status || 500).end();
        }
    });
});

// // เส้นทางสำหรับหน้า login
// app.get('/login', (req, res) => {
//     // เคลียร์ข้อความใน session เพื่อไม่ให้มันปรากฏซ้ำ
//     const errorMsg = req.session.error_msg;
//     req.session.error_msg = null; // เคลียร์ข้อความ
//     res.render('login', { error_msg: errorMsg }); // ส่ง error_msg ไปยัง template
// });

app.post("/add", (req, res) => {
    const { username, email, tel, birthday, gender, name } = req.body;
    const password = req.body.password; 


    if (!password) {
        return res.status(400).json({ message: "กรุณากรอกรหัสผ่าน" });
    }


    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน" });
        }

        const post = {
            username,
            password: hashedPassword, 
            name,
            gender,
            birthday,
            email,
            tel,
        };

        connection.query("INSERT INTO member SET ?", post, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
            }
            res.send(`
                        <script>
                            alert("สมัครสมาชิกสำเร็จ");
                            window.location.href = "/login";
                        </script>
                    `);
        });
    });
});



// app.get("/login", function(request, response) {
//     response.render('login.ejs');  
// });



app.get("/signout", function(request, response) {
    request.session.destroy(function (err) {
          response.send("Signout ready!");
          response.end();
    });
});

// Nodemailer transport setup for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'panttpa1@gmail.com',
        pass: 'plcp xwqg dsgx cija' // Use app password
    }
});

// Function to generate temporary password
const generateTemporaryPassword = () => {
    return crypto.randomBytes(4).toString("hex"); // Generate 8-character temporary password
};

// ฟังก์ชันสำหรับส่งอีเมลรหัสชั่วคราว
const sendEmail = (email, temporaryPassword, token) => {
    const mailOptions = {
        from: 'panttpa1@gmail.com',
        to: email,
        subject: 'รหัสผ่านชั่วคราวสำหรับการรีเซ็ตรหัสผ่านของคุณ',
        html: `
            <p>รหัสผ่านชั่วคราวของคุณคือ: <strong>${temporaryPassword}</strong></p>
            <p>โปรดใช้รหัสนี้เพื่อรีเซ็ตรหัสผ่านของคุณ หรือคลิกที่ลิงค์ด้านล่างเพื่อสร้างรหัสใหม่:</p>
            <p><a href="http://localhost:3500/change-password?token=${token}">รีเซ็ตรหัสผ่าน</a></p>
        ` // เปลี่ยน URL ให้เป็น URL จริงที่ผู้ใช้จะใช้ในการรีเซ็ตรหัสผ่าน
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

app.get("/forgot-password", function(request, response) {
    response.sendFile(path.join(__dirname, 'checkMail.html'));
});
// ฟังก์ชันสำหรับสร้าง token
const generateToken = () => {
    return crypto.randomBytes(32).toString("hex"); // สร้าง token แบบสุ่มที่ยาวขึ้นเพื่อความปลอดภัย
};
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;

    // ตรวจสอบว่าอีเมลนี้มีในฐานข้อมูลหรือไม่
    connection.query('SELECT * FROM member WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("เกิดข้อผิดพลาดในการค้นหาอีเมล.");
        }

        if (results.length === 0) {
            return res.status(400).send(`
                <script>
                    alert("ไม่พบอีเมลในระบบ.");
                    window.location.href = "/forgot-password";
                </script>
            `);
        }

        // สร้างและส่งรหัสผ่านชั่วคราว
        const tempPassword = generateTemporaryPassword();
        const token = crypto.randomBytes(32).toString("hex"); // สร้าง token

        sendEmail(email, tempPassword, token);

        // เข้ารหัสรหัสผ่านชั่วคราวก่อนบันทึก
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error(err);
                return res.status(500).send("เกิดข้อผิดพลาดในการสร้าง salt.");
            }

            bcrypt.hash(tempPassword, salt, (err, hashedPassword) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน.");
                }

                // อัปเดตรหัสผ่านในฐานข้อมูล
                connection.query(
                    "UPDATE member SET password = ? WHERE email = ?", [hashedPassword, email],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน.");
                        }

                        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมงจากตอนนี้

                    // บันทึก token และวันหมดอายุ
                    connection.query(
                        "INSERT INTO password_reset_tokens (email, token, expiry_date) VALUES (?, ?, ?)", [email, token, expiryDate],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send("เกิดข้อผิดพลาดในการบันทึก token.");
                            }

                            // ส่งข้อความสำเร็จ
                            res.send(`
                                <script>
                                    alert("โปรดตรวจสอบอีเมลของคุณสำหรับรหัสผ่านชั่วคราว.");
                                    window.location.href = "/login";
                                </script>
                            `);
                        }
                    );

                    }
                );
            });
        });
    });
});

// เส้นทางสำหรับการเปลี่ยนรหัสผ่านใหม่
app.get('/change-password', (req, res) => {
    const { token } = req.query;

    // ตรวจสอบ token ในฐานข้อมูล และตรวจสอบวันหมดอายุ
    connection.query('SELECT * FROM `password_reset_tokens` WHERE token = ?', [token], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("เกิดข้อผิดพลาดในการตรวจสอบ token.");
        }

        if (results.length === 0) {
            return res.send(`
                                <script>
                                    alert("Token นี้ไม่ถูกต้องหรือหมดอายุ");
                                    window.location.href = "/login";
                                </script>
                            `);
            // res.status(400).send('Token นี้ไม่ถูกต้องหรือหมดอายุ');
        }

        const tokenData = results[0];
        const expiryDate = new Date(tokenData.expiry_date);

        // ตรวจสอบว่า token หมดอายุหรือยัง
        if (expiryDate < new Date()) {
            return res.status(400).send('Token นี้หมดอายุแล้ว');
        }

        // แสดงหน้าเปลี่ยนรหัสผ่านใหม่
        res.render('change-password', { token });
    });
});


// ฟังก์ชันที่ใช้ตรวจสอบและเปลี่ยนรหัสผ่าน
app.post('/change-password', (req, res) => {
    const { newpassword, token } = req.body;

    if (!newpassword) {
        return res.status(400).send('กรุณากรอกรหัสผ่าน');
    }

    // Query the token to find the associated email
    connection.query('SELECT * FROM `password_reset_tokens` WHERE token = ?', [token], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('เกิดข้อผิดพลาดในการตรวจสอบ token.');
        }

        if (results.length === 0) {
            return res.send(`
                                <script>
                                    alert("Token นี้ไม่ถูกต้องหรือหมดอายุ");
                                    window.location.href = "/login";
                                </script>
                            `);
            // res.status(400).send('Token นี้ไม่ถูกต้องหรือหมดอายุ');
        }

        const tokenData = results[0];
        const email = tokenData.email; // Extract the email from the token data

        // Hash the new password
        bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).send('เกิดข้อผิดพลาดในการแฮชรหัสผ่าน');
            }

            // Update the password in the database
            const query = "UPDATE member SET password = ? WHERE email = ?";
            connection.query(query, [hashedPassword, email], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการอัพเดตข้อมูล');
                }

                // Mark the token as used or delete it
                const deleteQuery = "DELETE FROM `password_reset_tokens` WHERE token = ?";
                connection.query(deleteQuery, [token], (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('เกิดข้อผิดพลาดในการลบ token');
                    }

                    res.send(`
                        <script>
                            alert("เปลี่ยนรหัสผ่านสำเร็จ");
                            window.location.href = "/login";
                        </script>
                    `);
                });
            });
        });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});