const db = require('../../config/db');
const jwt = require('jsonwebtoken');
const sms = require('../../config/sms');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function register({ phone, name }) {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const existing = await db('users').where({ phone }).first();
  if (existing) {
    await db('users').where({ phone }).update({ otp_code: otp, otp_expires_at: otpExpiry });
  } else {
    await db('users').insert({ phone, name, otp_code: otp, otp_expires_at: otpExpiry });
  }

  if (process.env.NODE_ENV === 'production') {
    await sms.send({
      to: [phone],
      message: `Votre code SafeTrace : ${otp}. Valable 10 minutes.`,
      from: process.env.AT_SENDER_ID
    });
  } else {
    console.log(`[DEV] OTP pour ${phone} : ${otp}`);
  }

  return { message: 'OTP envoyé par SMS' };
}

async function verifyOTP({ phone, otp }) {
  const user = await db('users').where({ phone }).first();
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  if (user.otp_code !== otp) throw { status: 400, message: 'Code OTP incorrect' };
  if (new Date(user.otp_expires_at) < new Date()) {
    throw { status: 400, message: 'Code OTP expiré' };
  }

  const payload = { id: user.id, phone: user.phone, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await db('users').where({ phone }).update({
    otp_code: null,
    otp_expires_at: null,
    refresh_token: refreshToken,
    is_verified: true,
    verified_at: new Date()
  });

  return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
}

async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw { status: 401, message: 'Refresh token invalide' };
  }
  const user = await db('users').where({ id: payload.id, refresh_token: refreshToken }).first();
  if (!user) throw { status: 401, message: 'Session révoquée' };

  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  return { accessToken };
}

module.exports = { register, verifyOTP, refresh };
