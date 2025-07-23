
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/get-attendance', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Step 1: Make a POST request to the login API endpoint
        const loginResponse = await axios.post('https://nss-attendance-backend.vercel.app/api/loginstudent', {
            studentId: username, // Use studentId as per the actual website's code
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if login was successful
        if (!loginResponse.data.success) {
            return res.status(401).send('Login failed. Please check your credentials.');
        }

        // Extract cookies from the login response
        const cookies = loginResponse.headers['set-cookie'];

        if (!cookies) {
            return res.status(401).send('Login successful, but no session cookies found.');
        }

        // Step 2: Verify student token to get the actual student ID
        const verifyTokenResponse = await axios.get('https://nss-attendance-backend.vercel.app/api/verifystudentToken', {
            headers: {
                'Cookie': cookies.join('; ')
            }
        });

        if (!verifyTokenResponse.data.success || !verifyTokenResponse.data.student || !verifyTokenResponse.data.student.id) {
            return res.status(401).send('Failed to verify student token or get student ID.');
        }

        const studentIdFromToken = verifyTokenResponse.data.student.id;

        // Step 3: Use the obtained student ID to make a request to the protected API endpoint
        const userDataResponse = await axios.post('https://nss-attendance-backend.vercel.app/api/loggedinuserrecord', {
            id: studentIdFromToken // Pass the 'id' as required by the API
        }, { 
            headers: {
                'Cookie': cookies.join('; '),
                'Content-Type': 'application/json' // Ensure content type is JSON
            }
        });

        console.log('User Data Response Data:', userDataResponse.data);

        res.json(userDataResponse.data); // Send JSON data back to the frontend
    } catch (error) {
        console.error('Error during attendance fetch:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        res.status(500).send('An error occurred on the server.');
    }
});

app.post('/get-attendance', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Step 1: Make a POST request to the login API endpoint
        const loginResponse = await axios.post('https://nss-attendance-backend.vercel.app/api/loginstudent', {
            studentId: username, // Use studentId as per the actual website's code
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if login was successful
        if (!loginResponse.data.success) {
            return res.status(401).send('Login failed. Please check your credentials.');
        }

        // Extract cookies from the login response
        const cookies = loginResponse.headers['set-cookie'];

        if (!cookies) {
            return res.status(401).send('Login successful, but no session cookies found.');
        }

        // Step 2: Use the cookies to make a request to the protected API endpoint
        const userDataResponse = await axios.post('https://nss-attendance-backend.vercel.app/api/loggedinuserrecord', {
            studentId: username // Pass the studentId in the request body
        }, { 
            headers: {
                'Cookie': cookies.join('; '),
                'Content-Type': 'application/json' // Ensure content type is JSON
            }
        });

        console.log('User Data Response Data:', userDataResponse.data);

        res.json(userDataResponse.data); // Send JSON data back to the frontend
    } catch (error) {
        console.error('Error during attendance fetch:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        res.status(500).send('An error occurred on the server.');
    }
});



module.exports = app;
