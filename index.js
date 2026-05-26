const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

const routesPath = path.join(__dirname, 'src', 'routes');

fs.readdirSync(routesPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const routeName = file.replace('-route.js', '');
    const route = require(path.join(routesPath, file));
    app.use(`/api/${routeName}`, route);
  });

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});