const chatModel = {
  collection: 'messages',
  fields: ['roomId', 'senderId', 'content', 'attachments', 'createdAt'],
};

module.exports = { chatModel };
