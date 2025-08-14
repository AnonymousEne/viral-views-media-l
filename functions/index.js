const functions = require('firebase-functions')

// Simple test function
exports.test = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  res.json({ 
    message: 'Backend APIs are working!', 
    timestamp: new Date().toISOString() 
  })
})
