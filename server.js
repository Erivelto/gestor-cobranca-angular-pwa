const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/browser')));

// For all GET requests, send back index.html so that PathLocationStrategy can be used
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/browser/index.html'));
});

// Start the app by listening on the default Azure port
const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`App running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});