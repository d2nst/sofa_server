const mongoose = require('mongoose');
const schema = require('./schema');
require('dotenv').config();
const { MONGODB_ID, MONGODB_PW } = process.env;

mongoose
	.connect(`mongodb+srv://${MONGODB_ID}:${MONGODB_PW}@cluster.n1mscvt.mongodb.net/sofa`)
	.then(() => console.log('MongoDB에 연결 중...'))
	.catch(console.error);

const model = Object.keys(schema).reduce((acc, key) => {
	acc[key] = mongoose.model(key, schema[key]);
	return acc;
}, {});

module.exports = model;
