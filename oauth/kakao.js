const express = require('express');
const router = express.Router();
const axios = require('axios');
const { login } = require('../controller/authController');
const { User } = require('../mongoose/model');
const { KAKAO_REDIRECT_URI, KAKAO_REST_KEY, FRONT_HOST } = process.env;

// 카카오 요청
router.post('/auth/kakao/callback', async (req, res) => {
	const { authorizationCode } = req.body;
	const code = authorizationCode;
	console.log('code: ', code);

	try {
		const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
			params: {
				grant_type: 'authorization_code',
				client_id: KAKAO_REST_KEY,
				redirect_uri: `${FRONT_HOST}${KAKAO_REDIRECT_URI}`,
				code,
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		const kakkoAccessToken = tokenResponse.data.access_token;
		// 액세스 토큰으로 사용자 정보 요청
		const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
			headers: {
				Authorization: `Bearer ${kakkoAccessToken}`,
			},
		});

		const kakaoUser = userResponse.data;
		const {
			id,
			properties: { nickname, profile_image },
		} = kakaoUser;

		// 사용자 정보 저장/업데이트
		let user = await User.findOne({ snsId: id, provider: 'kakao' });
		if (!user) {
			user = new User({
				provider: 'kakao',
				snsId: id,
				nickname,
				profileimage: profile_image,
			});
			await user.save();
		}
		login(req, res, user);
	} catch (error) {
		console.error('Kakao login error:', error);
		res.status(500).json({ message: '카카오 로그인 실패' });
	}
});

module.exports = router;
