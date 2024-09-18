const { createAccessToken, createRefreshToken, verifyToken } = require('../utils/jwt');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, FRONT_HOST } = process.env;

// 로그인 처리 (Access Token, Refresh Token 발급)
function login(req, res, user) {
	const accessToken = createAccessToken(user);
	const refreshToken = createRefreshToken(user);

	// Refresh Token을 HttpOnly 쿠키로 설정
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true, // 클라이언트 측에서 접근 불가 개발에서 false 배포에서 ture
		sameSite: 'none', // CSRF 공격 방지 개발에서 none 배포 strict
		secure: true, // HTTPS에서만 전송 개발에서 false 배포에서 process.env.NODE_ENV === 'production'
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 만료
	});

	res.json({
		user: {
			nickname: user.nickname,
			image: user.profile_image,
			accessToken,
		},
	});
}

// 토큰 갱신 (Refresh Token을 이용해 새로운 Access Token 발급)
async function refreshToken(req, res) {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) return res.sendStatus(401);

	try {
		const user = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET);
		const newAccessToken = createAccessToken(user);

		res.json({ accessToken: newAccessToken });
	} catch (error) {
		return res.sendStatus(403); // Refresh Token 검증 실패
	}
}

module.exports = { login, refreshToken };
