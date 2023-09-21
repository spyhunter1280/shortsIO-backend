const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIfsInR5cCI6IkpXVCJ9.eyJmaXJzdE5hbWUiOiJLYWkiLCJsYXN0TmFtZSI6IkNoYW4iLCJ1c2VyTmFtZSI6ImFscGhhIiwiZW1haWwiOiJqb3NpYWhkaWxsb24zQGdtYWlsLmNvbSIsImlhdCI6MTY5MjIxMjc0NiwiZXhwIjoxNjkyMjk5MTQ2fQ.fadmbUupmNJlOGUkD3WhzNOwRahZ_HSQOmP1E-AP2fg'
jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
        console.log('err') // Forbidden
    }
    console.log('success')
    // Valid token, set the user in the request object
});