const { onRequest } = require('firebase-functions/v2/https')

// Simple test function
exports.test = onRequest((req, res) => {
  res.json({ message: 'Hello World' })
})

console.log('Functions defined:', Object.keys(exports))
