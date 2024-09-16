const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../mongoose/model');
const { KAKAO_REDIRECT_URI, KAKAO_REST_KEY } = process.env;
// 카카오 요청
router.post('/auth/kakao/callback', async (req, res) => {
	const { authorizationCode } = req.body;
	const code = authorizationCode;
	const secret = req.app.get('jwt-secret');
	try {
		const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
			params: {
				grant_type: 'authorization_code',
				client_id: KAKAO_REST_KEY,
				redirect_uri: `http://localhost:5173${KAKAO_REDIRECT_URI}`,
				code,
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		const accessToken = tokenResponse.data.access_token;
		// 액세스 토큰으로 사용자 정보 요청
		const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const kakaoUser = userResponse.data;
		const {
			id,
			properties: { nickname, profile_image },
		} = kakaoUser;

		// 사용자 정보 저장/업데이트
		// let user = await User.findOne({ kakaoId: id });
		// if (!user) {
		// 	user = new User({

		// 		nickname,
		// 		email,
		// 	});
		// 	await user.save();
		// }

		// JWT 생성
		const token = jwt.sign(
			{
				id: id,
				// email: email,
				nickname: nickname,
			},
			secret,
			{
				expiresIn: '7d',
				issuer: 'sofa',
				subject: 'auth',
			}
		);

		// 클라이언트로 사용자 정보와 JWT 반환
		res.json({
			token,
			user: {
				id: id,
				nickname: nickname,
				// email: user.email,
				image: profile_image,
			},
		});
	} catch (error) {
		console.error('Kakao login error:', error);
		res.status(500).json({ message: '카카오 로그인 실패' });
	}
});

module.exports = router;
