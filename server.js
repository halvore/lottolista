const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const DATA_FILE = './data.json';

// Get current data
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Could not read data file' });
    }
});

// Save data
app.post('/api/data', (req, res) => {
    try {
        const newData = req.body;
        
        // Write new data
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
        console.log('Data file updated successfully');
        
        res.json({ 
            success: true, 
            message: 'Data saved successfully'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Could not save data file' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Lottolista server running on http://localhost:${PORT}`);
    console.log(`📂 Admin interface: http://localhost:${PORT}/admin/`);
    console.log(`📄 Main page: http://localhost:${PORT}/`);
});