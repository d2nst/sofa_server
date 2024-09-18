const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { User } = require('../mongoose/model');
const { login, refreshToken } = require('../controller/authController');

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

	login(req, res, loginUser);
});

// 사용자 추가

// 파일 저장 설정
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/images/userprofile'); // 파일 저장 경로
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname)); // 파일명 설정
	},
});

const upload = multer({ storage: storage }).single('profileimage'); // 단일 파일 업로드로 설정

// 사용자 추가
router.post('/api/user/create', (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ error: '파일 업로드 실패' });
		}

		const { name, email, password, nickname, address } = req.body;
		let imagePath = null;

		// 이미지 파일이 있는 경우에만 처리
		if (req.file) {
			imagePath = `/uploads/images/userprofile/${req.file.filename}`;
		}

		try {
			// 새로운 사용자 저장
			const newUser = await new User({
				email,
				name,
				password,
				nickname,
				address,
				profileimage: imagePath, // 이미지 경로 저장
			}).save();

			res.status(201).json({ success: true, message: '환영합니다.' });
		} catch (error) {
			console.error('사용자 생성 실패:', error);
			res.status(500).json({ success: false, message: '사용자 생성 실패' });
		}
	});
});

// 사용자 토큰 체크
router.get('/api/user/token', refreshToken);
// 사용자 정보 변경

// 사용자 삭제

// 프로필 이미지 추가

module.exports = router;
