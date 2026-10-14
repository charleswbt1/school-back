const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:3001',
    'https://school-web-764239827508.us-east1.run.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.error('Origen bloqueado por CORS:', origin);
        return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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