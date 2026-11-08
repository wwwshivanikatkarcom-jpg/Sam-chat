const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
admin.initializeApp();

const norm = (s) => String(s || '').trim().toLowerCase();

exports.resetPassword = functions.https.onRequest((req, res) => cors(req, res, async () => {
  try {
    const { u, a1, a2, np } = req.body || {};
    if (!/^[a-z0-9_]+$/.test(u || '') || !/^[0-9]{10}$/.test(np || '')) { return res.status(400).send('bad'); }
    const user = await admin.auth().getUserByEmail(u + '@sam.chat');
    const tr = admin.database().ref('tries/' + u);
    const ts = (await tr.once('value')).val() || { n: 0, t: 0 };
    if (ts.n >= 5 && Date.now() - ts.t < 3600000) { return res.status(429).send('wait'); }
    const rec = (await admin.database().ref('recovery/' + user.uid).once('value')).val();
    if (!rec || norm(rec.a1) !== norm(a1) || norm(rec.a2) !== norm(a2)) {
      await tr.set({ n: ts.n + 1, t: Date.now() });
      return res.status(403).send('no');
    }
    await admin.auth().updateUser(user.uid, { password: np });
    await tr.remove();
    res.send('ok');
  } catch (e) {
    res.status(400).send('err');
  }
}));
