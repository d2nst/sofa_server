const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
require('dotenv').config();
const { SALTSECRET } = process.env;

const User = new Schema({
	email: { type: String, required: true, unique: true },
	hashedPassword: { type: String, required: true },
	salt: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, required: true },
	name: { type: String, required: true, unique: true },
});

// password는 가상 선택자
User.virtual('password').set(function (password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashedPassword = this.encryptPassword(password);
});

// 살트 생성 함수
User.method('makeSalt', () => {
	return Math.round(new Date().valueOf() * Math.random()) + SALTSECRET;
});

// 해시된 비밀번호 생성 함수
User.method('encryptPassword', function (plainPassword) {
	return crypto.createHmac('sha256', this.salt).update(plainPassword).digest('hex');
});

// 사용자 인증 함수
User.method('authenticate', function (plainPassword) {
	const inputPassword = this.encryptPassword(plainPassword);
	return inputPassword === this.hashedPassword;
});

module.exports = User;
