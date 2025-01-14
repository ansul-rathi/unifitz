// src/pages/api/save-to-sheets.js
import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Get the form data
        const formData = req.body;
        
        // Format data for sheets
        const values = [[
            new Date().toISOString(), // Timestamp
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.phone,
            formData.age,
            formData.gender,
            formData.profession,
            formData.height,
            formData.weight,
            formData.fitnessGoal,
            formData.preferredTime,
            formData.experience,
            formData.medicalConditions?.join(', '),
            formData.dietaryRestrictions
        ]];

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:O', // Adjust based on your columns
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}