const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../mongoose/model');

// 로그인 요청
router.post('/api/user/login', async (req, res) => {
	const { email, password } = req.body;

	const loginUser = await User.findOne({ email });
	if (!loginUser) {
		return res.status(404).send({
			error: true,
			msg: '가입되지 않는 이메일입니다.',
		});
	}

	const correctPassword = await loginUser.authenticate(password);
	if (!correctPassword) {
		return res.status(401).send({
			error: true,
			msg: '비밀번호 일치하지 않습니다.',
		});
	}

	const secret = req.app.get('jwt-secret');

	const token = jwt.sign(
		{
			id: loginUser._id,
			email: loginUser.email,
		},
		secret,
		{
			expiresIn: '7d',
			issuer: 'sofa',
			subject: 'auth',
		}
	);
	res.status(200).send({
		email: loginUser.email,
		token: token,
		error: false,
		msg: `${loginUser.name}님 안녕하세요!`,
	});
});

// 사용자 추가
router.post('/api/user/create', async (req, res) => {
	const { name, email, password } = req.body;
	console.log(req.body);
	const newUser = await User({
		email,
		name,
		password,
	}).save();

	res.send(newUser._id ? true : false);
});

// 사용자 토큰 체크
router.get('/api/user/token', (req, res) => {
	const { authorization } = req.headers;
	if (!authorization) {
		return res.send(false);
	}
	const token = authorization.split(' ')[1];
	const secret = req.app.get('jwt-secret');
	jwt.verify(token, secret, (err, data) => {
		if (err) {
			res.send(err);
		}
		res.send({
			email: data.email,
			nickname: data.nickname,
		});
	});
});

// 사용자 정보 변경

// 사용자 삭제

// 프로필 이미지 추가

module.exports = router;
