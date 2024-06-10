import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(cookieParser());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: 'projet react'
});

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "You are not authenticated" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.json({ Error: "Token is not correct" });
            } else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name })
})

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

app.post('/register', (req, res) => {
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?)";
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ Error: "Please provide name, email, and password" });
    }

    bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ Error: "Error hashing password" });
        }

        const values = [name, email, hash];
        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ Error: "Inserting data Error in server" });
            }
            return res.json({ Status: "Success" });
        });
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ Error: "Internal Server Error" });
});

app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM login WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if (err) return res.json({ Error: "Login error in server" });
        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) return res.json({ Error: "Password compare error" });
                if (response) {
                    const name = data[0].name;
                    const token = jwt.sign({ name }, "jwt-secret-key", { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ Status: "Success" });
                } else {
                    return res.json({ Error: "Password not matched" });
                }
            })
        } else {
            return res.json({ Error: "No email existed" });
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" });
})


app.get('/class/:className/timetable', verifyUser, (req, res) => {
    const className = req.params.className;
    const classTimetable = {
           'DSI21': [
            { Time: '8h', Professor: 'Ahmed Ali', Subject: 'Mathématiques' },
            { Time: '9h', Professor: 'Mohammed Ahmed', Subject: 'Sciences' },
            { Time: '10h', Professor: 'Abdullah Hussein', Subject: 'Histoire' },
            { Time: '11h', Professor: 'Fatima Youssef', Subject: 'Langues' },
            { Time: '12h', Professor: 'Mahmoud Khaled', Subject: 'Informatique' },
            { Time: '14h', Professor: 'Amina Abdelrahman', Subject: 'Arts' },
            { Time: '15h', Professor: 'Salma Mohammed', Subject: 'Éducation physique' },
            { Time: '16h', Professor: 'Youssef Ali', Subject: 'Géographie' },
            { Time: '17h', Professor: 'Layla Ahmed', Subject: 'Musique' },
            { Time: '18h', Professor: 'Ahmed Mahmoud', Subject: 'Économie' }
        ],
        'DSI22': [
            { Time: '8h', Professor: 'Ahmed Ali', Subject: 'Biology' },
            { Time: '9h', Professor: 'Mohammed Ahmed', Subject: 'Chemistry' },
            { Time: '10h', Professor: 'Abdullah Hussein', Subject: 'Physics' },
            { Time: '11h', Professor: 'Fatima Youssef', Subject: 'French' },
            { Time: '12h', Professor: 'Mahmoud Khaled', Subject: 'English' },
            { Time: '14h', Professor: 'Amina Abdelrahman', Subject: 'Spanish' },
            { Time: '15h', Professor: 'Salma Mohammed', Subject: 'German' },
            { Time: '16h', Professor: 'Youssef Ali', Subject: 'Domestic Economy' },
            { Time: '17h', Professor: 'Layla Ahmed', Subject: 'Technology' },
        ],
        'TI11': [
            { Time: '8h', Professor: 'Khaled Abdelrahman', Subject: 'Social Sciences' },
            { Time: '9h', Professor: 'Ahmed Patel', Subject: 'Religious Studies' },
            { Time: '10h', Professor: 'Mohammed Li', Subject: 'Philosophy' },
            { Time: '11h', Professor: 'Youssef Nguyen', Subject: 'Psychology' },
            { Time: '12h', Professor: 'Fatima Khaled', Subject: 'Anthropology' },
            { Time: '14h', Professor: 'Aisha Abdulrahman', Subject: 'Archaeology' },
            { Time: '15h', Professor: 'Mohammed Hassan', Subject: 'Linguistics' },
            { Time: '16h', Professor: 'Layla Chen', Subject: 'Media Studies' },
            { Time: '17h', Professor: 'Salma Youssef', Subject: 'Cinematography' },
            { Time: '18h', Professor: 'Ali Hassan', Subject: 'Theater' }
        ],
        'TI12': [
            { Time: '8h', Professor: 'Ali Lee', Subject: 'Environmental Studies' },
            { Time: '9h', Professor: 'Ahmed Singh', Subject: 'Graphic Design' },
            { Time: '10h', Professor: 'Yamamoto Ali', Subject: 'Nutrition' },
            { Time: '11h', Professor: 'Hussein Hernandez', Subject: 'Journalism' },
            { Time: '12h', Professor: 'Rossi Mahmoud', Subject: 'Gender Studies' },
            { Time: '14h', Professor: 'Ali Abdallah', Subject: 'Astronomy' },
            { Time: '15h', Professor: 'Park Mahmoud', Subject: 'Urban Studies' },
            { Time: '16h', Professor: 'Fischer Hussein', Subject: 'Criminology' },
            { Time: '17h', Professor: 'Ibrahim Ali', Subject: 'Marine Archaeology' },
            { Time: '18h', Professor: 'Garcia Mahmoud', Subject: 'Psychoanalysis' }
        ],
        'TI13': [
            { Time: '8h', Professor: 'Wang Mahmoud', Subject: 'Civil Engineering' },
            { Time: '9h', Professor: 'Santos Hussein', Subject: 'Film Studies' },
            { Time: '10h', Professor: 'Novak Ali', Subject: 'Social Psychology' },
            { Time: '11h', Professor: 'Costa Mahmoud', Subject: 'Ethics' },
            { Time: '12h', Professor: 'Kimura Hussein', Subject: 'Market Studies' },
            { Time: '14h', Professor: 'Dubois Ahmed', Subject: 'Applied Linguistics' },
            { Time: '15h', Professor: 'Caruso Fatima', Subject: 'International Finance' },
            { Time: '16h', Professor: 'O\'Connor Hussein', Subject: 'Genetics' },
            { Time: '17h', Professor: 'Vasquez Salma', Subject: 'Veterinary Medicine' },
            { Time: '18h', Professor: 'Schneider Ahmed', Subject: 'Urban Planning' }
        ],
        'TI14': [
            { Time: '8h', Professor: 'Abdulrahman Patel', Subject: 'Biotechnology' },
            { Time: '9h', Professor: 'Mohammed Nguyen', Subject: 'Cognitive Psychology' },
            { Time: '10h', Professor: 'Ali Gomez', Subject: 'Ecology' },
            { Time: '11h', Professor: 'Mahmoud Ivanov', Subject: 'Political Theory' },
            { Time: '12h', Professor: 'Fatima Fernandez', Subject: 'Development Economics' },
            { Time: '14h', Professor: 'Aisha Kim', Subject: 'Peace Studies' },
            { Time: '15h', Professor: 'Mohammed Li', Subject: 'International Marketing' },
            { Time: '16h', Professor: 'Amira Costa', Subject: 'Geology' },
            { Time: '17h', Professor: 'Noor Ivanova', Subject: 'Nutritional Science' },
            { Time: '18h', Professor: 'Youssef Khan', Subject: 'Alternative Medicine' }
        ]
    };
    

    const data = classTimetable[className];

    if (!data) {
        return res.status(404).json({ error: 'Classe non trouvée' });
    }

    return res.json({ timetable: data });
});


app.get('/class/:className/results', verifyUser, (req, res) => {
    const className = req.params.className;

    const classData = {
        'DSI21': [
            { name: 'Mohamed Ali', grades: [17, 18, 15] },
            { name: 'Yasmine Mansour', grades: [16, 17, 18] },
            { name: 'Omar Khattab', grades: [15, 16, 14] },
            { name: 'Léa Abboud', grades: [18, 17, 17] },
            { name: 'Karim Fahmy', grades: [19, 18, 18] },
            { name: 'Noura Youssef', grades: [17, 16, 16] },
            { name: 'Ali Mahmoud', grades: [18, 18, 16] },
            { name: 'Rania Ibrahim', grades: [16, 17, 16] },
            { name: 'Sarah Ahmed', grades: [15, 15, 16] },
            { name: 'Hassan Nader', grades: [18, 19, 18] }
        ],
        'DSI22': [
            { name: 'Ahmed Hassan', grades: [17, 18, 15] },
            { name: 'Fatima Omar', grades: [16, 17, 18] },
            { name: 'Sara Khalid', grades: [15, 16, 14] },
            { name: 'Omar Khalifa', grades: [18, 17, 17] },
            { name: 'Amina Ali', grades: [19, 18, 18] },
            { name: 'Youssef Fahd', grades: [17, 16, 16] },
            { name: 'Lina Mahmoud', grades: [18, 18, 16] },
            { name: 'Yasmine Abdelrahman', grades: [16, 17, 16] },
            { name: 'Adam Ahmed', grades: [15, 15, 16] },
            { name: 'Hala Said', grades: [18, 19, 18] }
        ],
        'TI11': [
            { name: 'Rami Ali', grades: [17, 18, 15] },
            { name: 'Leila Mahmoud', grades: [16, 17, 18] },
            { name: 'Sami Mansour', grades: [15, 16, 14] },
            { name: 'Farah Khalil', grades: [18, 17, 17] },
            { name: 'Nadia Ahmed', grades: [19, 18, 18] },
            { name: 'Ali Fahd', grades: [17, 16, 16] },
            { name: 'Salma Omar', grades: [18, 18, 16] },
            { name: 'Amir Ibrahim', grades: [16, 17, 16] },
            { name: 'Layla Nader', grades: [15, 15, 16] },
            { name: 'Khalid Khattab', grades: [18, 19, 18] }
        ],
        'TI12': [
            { name: 'Sara Ali', grades: [17, 18, 15] },
            { name: 'Khaled Fahmy', grades: [16, 17, 18] },
            { name: 'Fatima Khalid', grades: [15, 16, 14] },
            { name: 'Mahmoud Youssef', grades: [18, 17, 17] },
            { name: 'Leila Omar', grades: [19, 18, 18] },
            { name: 'Ali Ahmed', grades: [17, 16, 16] },
            { name: 'Hana Mahmoud', grades: [18, 18, 16] },
            { name: 'Omar Said', grades: [16, 17, 16] },
            { name: 'Yasmin Hassan', grades: [15, 15, 16] },
            { name: 'Amira Abdelrahman', grades: [18, 19, 18] }
        ],
        'TI13': [
            { name: 'Sara Ali', grades: [17, 18, 15] },
            { name: 'Khaled Fahmy', grades: [16, 17, 18] },
            { name: 'Fatima Khalid', grades: [15, 16, 14] },
            { name: 'Mahmoud Youssef', grades: [18, 17, 17] },
            { name: 'Leila Omar', grades: [19, 18, 18] },
            { name: 'Ali Ahmed', grades: [17, 16, 16] },
            { name: 'Hana Mahmoud', grades: [18, 18, 16] },
            { name: 'Omar Said', grades: [16, 17, 16] },
            { name: 'Yasmin Hassan', grades: [15, 15, 16] },
            { name: 'Amira Abdelrahman', grades: [18, 19, 18] }
        ],
        'TI14': [
            { name: 'Fatima Ali', grades: [17, 18, 15] },
            { name: 'Ahmed Mahmoud', grades: [16, 17, 18] },
            { name: 'Lina Khalid', grades: [15, 16, 14] },
            { name: 'Khalid Omar', grades: [18, 17, 17] },
            { name: 'Yasmine Ahmed', grades: [19, 18, 18] },
            { name: 'Ali Fahd', grades: [17, 16, 16] },
            { name: 'Noura Hassan', grades: [18, 18, 16] },
            { name: 'Sara Said', grades: [16, 17, 16] },
            { name: 'Youssef Nader', grades: [15, 15, 16] },
            { name: 'Leila Khattab', grades: [18, 19, 18] }
        ]
    };

    const students = classData[className];

    if (!students) {
        return res.status(404).json({ error: 'Classe non trouvée' });
    }

    const results = students.map(student => {
        const average = student.grades.reduce((total, grade) => total + grade, 0) / student.grades.length;
        return { studentName: student.name, result: average, grades: student.grades };
    });

    return res.json({ results });
});


app.listen(8080, () => {
    console.log('Server running on port 8080...');
});

