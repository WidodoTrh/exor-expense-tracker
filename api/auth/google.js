import { findOrCreateSpreadsheet } from "../_lib/sheets.js";
import { getRedisClient } from '../_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    // 1. Tuker authorization code ke token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'postmessage', // karena pakai popup flow (@react-oauth/google)
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
        console.error('Token exchange failed:', tokenData);
        return res.status(400).json({ error: 'Token exchange failed', detail: tokenData });
    }

    const { access_token, refresh_token, id_token } = tokenData;

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userInfo = await userInfoRes.json();

    const user = {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    // 3. Cek apakah user udah punya spreadsheet (via Drive API, cari file dgn appProperties)
    const redis = await getRedisClient();
    const invitedSpreadsheetId = await redis.get(`invite:${user.email.toLowerCase()}`);
    const spreadsheetId = invitedSpreadsheetId || await findOrCreateSpreadsheet(access_token, user.email);
    // const spreadsheetId = await findOrCreateSpreadsheet(access_token, user.email)
    
    // 5. Simpan refresh_token di httpOnly cookie
    if (refresh_token) {
      res.setHeader(
        'Set-Cookie',
        `refresh_token=${refresh_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`
      );
    }

    return res.status(200).json({
      access_token,
      user,
      spreadsheetId,
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}