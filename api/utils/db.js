import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI; // 환경 변수에서 URI 가져오기

    if (!uri) {
        throw new Error('MONGO_URI 환경 변수가 설정되지 않았습니다.');
    }

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB 연결 성공');
    } catch (error) {
        console.error('MongoDB 연결 실패:', error.message);
        throw new Error('MongoDB 연결 실패');
    }
};

export default connectDB;
