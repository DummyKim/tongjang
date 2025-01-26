import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          '유효한 이메일 형식을 입력하세요.',
      ],
    },
    password: {
        type: String,
        required: true,
    },
});

// 비밀번호 암호화
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
