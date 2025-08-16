
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorConverter, errorHandler } = require('./middleware/error');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/courses', require('./routes/course.routes'));
// app.use('/api/questions', require('./routes/question.routes'));
// app.use('/api/tests', require('./routes/test.routes'));
// app.use('/api/attempts', require('./routes/attempt.routes'));
// app.use('/api/payments', require('./routes/payment.routes'));

// Error handling
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
