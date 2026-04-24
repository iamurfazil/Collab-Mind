const { db } = require('../config/firebaseAdmin');

async function queueEmail({ to, subject, text, html }) {
  if (!to) {
    return false;
  }

  const message = {
    subject: subject || 'Collab Mind Notification',
    text: text || '',
  };

  if (html) {
    message.html = html;
  }

  await db.collection('mail').add({
    to,
    message,
  });

  return true;
}

module.exports = { queueEmail };
