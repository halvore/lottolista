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
const BACKUP_DIR = './backups';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Get current data
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Could not read data file' });
    }
});

// Save data with automatic backup
app.post('/api/data', (req, res) => {
    try {
        const newData = req.body;
        
        // Create backup of current file
        if (fs.existsSync(DATA_FILE)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
            const backupPath = path.join(BACKUP_DIR, `data-backup-${timestamp}.json`);
            fs.copyFileSync(DATA_FILE, backupPath);
            console.log(`Backup created: ${backupPath}`);
        }
        
        // Write new data
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
        console.log('Data file updated successfully');
        
        res.json({ 
            success: true, 
            message: 'Data saved successfully',
            backup: true
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Could not save data file' });
    }
});

// List backups
app.get('/api/backups', (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('data-backup-') && file.endsWith('.json'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                created: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.created - a.created);
        
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Could not list backups' });
    }
});

// Restore from backup
app.post('/api/restore/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const backupPath = path.join(BACKUP_DIR, filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }
        
        // Create backup of current file before restoring
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
        const currentBackupPath = path.join(BACKUP_DIR, `data-backup-before-restore-${timestamp}.json`);
        fs.copyFileSync(DATA_FILE, currentBackupPath);
        
        // Restore from backup
        fs.copyFileSync(backupPath, DATA_FILE);
        
        res.json({ 
            success: true, 
            message: 'Data restored from backup',
            currentBackup: `data-backup-before-restore-${timestamp}.json`
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not restore from backup' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Lottolista server running on http://localhost:${PORT}`);
    console.log(`📂 Admin interface: http://localhost:${PORT}/admin/`);
    console.log(`📄 Main page: http://localhost:${PORT}/`);
    console.log(`💾 Backups stored in: ${path.resolve(BACKUP_DIR)}`);
});