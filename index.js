const express = require('express');
const app = express();
const cors = require('cors');
const { user } = require('./router');
require('dotenv').config();
const { PORT, JWT_SECRET } = process.env;
const port = PORT || 3001;
const SECRET = 'JWT_SECRET';

// JWT 시크릿 설정
app.set('jwt-secret', SECRET);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(user);
app.get('/', (req, res) => {
	res.send('hello world');
});

app.listen(port, () => {
	console.log(`app listening on port ${port}`);
});
