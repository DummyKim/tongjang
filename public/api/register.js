import 'dotenv/config';
import connectDB from './utils/db.js';
import User from './utils/UserModel.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: '모든 필드를 입력하세요.' });
        }

        try {
            await connectDB();

            // 중복 확인
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({
                    message: existingUser.username === username
                        ? '이미 존재하는 사용자 이름입니다.'
                        : '이미 존재하는 이메일입니다.',
                });
            }

            // 새 사용자 저장
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
