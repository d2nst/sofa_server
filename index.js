const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const { user, kakao } = require('./router');
require('dotenv').config();
const { PORT, JWT_SECRET } = process.env;
const port = PORT;
const SECRET = JWT_SECRET;

// JWT 시크릿 설정
app.set('jwt-secret', SECRET);

app.use(cors({ exposedHeaders: ['Authorization'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(user);
app.use(kakao);

app.get('/', (req, res) => {
	res.send('Server is running!');
});

app.listen(port, () => {
	console.log(`App listening at ${PORT}`);
});
