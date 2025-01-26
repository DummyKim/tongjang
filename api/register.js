import 'dotenv/config';
import connectDB from './utils/db.js';
import User from './utils/UserModel.js';



const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI 환경 변수가 설정되지 않았습니다.');
    }

    // MongoDB 연결
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};




export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: '모든 필드를 입력하세요.' });
        }

        try {
            await connectDB();

            // 이메일 중복 확인
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
            }

            // 유저 생성
            const newUser = new User({ username, email, password });
            await newUser.save();

            res.status(201).json({ message: '회원가입 성공!' });
        } catch (error) {
            console.error('회원가입 오류:', error.message);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: '허용되지 않은 메서드입니다.' });
    }
}
