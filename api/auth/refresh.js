import { findOrCreateSpreadsheet } from "../_lib/sheets.js";
import { getRedisClient } from '../_lib/redis.js';

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').filter(Boolean).map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req);
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      res.setHeader('Set-Cookie', `refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
      return res.status(401).json({ error: 'Refresh failed', detail: tokenData });
    }

    const { access_token } = tokenData;

    // Ganti decode id_token -> pakai userinfo endpoint (konsisten sama google.js)
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userInfo = await userInfoRes.json();
    const user = { email: userInfo.email, name: userInfo.name, picture: userInfo.picture };

    const redis = await getRedisClient();
    const invitedSpreadsheetId = await redis.get(`invite:${user.email.toLowerCase()}`);
    const spreadsheetId = invitedSpreadsheetId || await findOrCreateSpreadsheet(access_token, user.email);
    // const spreadsheetId = await findOrCreateSpreadsheet(access_token, user.email);

    return res.status(200).json({ access_token, user, spreadsheetId });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}