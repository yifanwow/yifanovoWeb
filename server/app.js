const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000'  // 确保这里的 URL 是你的前端应用的 URL
  }));
app.use(bodyParser.json());
app.use('/api', emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
