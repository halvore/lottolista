const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'lottolista-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('.'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : [];

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `${process.env.VERCEL_URL}/auth/google/callback`
        : "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const userEmail = profile.emails[0].value;
    
    if (ADMIN_EMAILS.includes(userEmail)) {
        return done(null, {
            id: profile.id,
            email: userEmail,
            name: profile.displayName,
            avatar: profile.photos[0]?.value
        });
    } else {
        return done(null, false, { message: 'Access denied - not in admin list' });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

function requireAuthAPI(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

const DATA_FILE = './data.json';

// Migration function to import existing JSON data to Supabase
async function migrateDataToSupabase() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('📄 No existing data.json file found, skipping migration');
            return;
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        const { data: existingParticipants } = await supabase
            .from('participants')
            .select('id')
            .limit(1);

        if (existingParticipants && existingParticipants.length > 0) {
            console.log('📊 Database already contains data, skipping migration');
            return;
        }

        console.log('🔄 Migrating data from JSON to Supabase...');
        
        for (const person of data) {
            const { data: participant, error: participantError } = await supabase
                .from('participants')
                .insert({
                    navn: person.navn,
                    avatar: person.avatar
                })
                .select()
                .single();

            if (participantError) throw participantError;

            if (person.vunnet && person.vunnet.length > 0) {
                const winningData = person.vunnet.map(winning => ({
                    participant_id: participant.id,
                    amount: winning[0],
                    date: winning[1]
                }));

                const { error: winningsError } = await supabase
                    .from('winnings')
                    .insert(winningData);

                if (winningsError) throw winningsError;
            }
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Authentication routes
app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login?error=access_denied' }),
    (req, res) => {
        res.redirect('/admin/');
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login?message=logged_out');
    });
});

app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            authenticated: true, 
            user: req.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Root route - serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Static file routes
app.get('/src/index.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.css'));
});

app.get('/assets/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', req.params.filename));
});

// Protect admin directory
app.get('/admin/*', requireAuth, (req, res, next) => {
    next();
});

// Public data endpoint for main page
app.get('/data.json', async (req, res) => {
    try {
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .order('id', { ascending: true });

        if (participantsError) throw participantsError;

        const { data: winnings, error: winningsError } = await supabase
            .from('winnings')
            .select('*')
            .order('date', { ascending: true });

        if (winningsError) throw winningsError;

        const formattedData = participants.map(participant => {
            const participantWinnings = winnings
                .filter(w => w.participant_id === participant.id)
                .map(w => [w.amount, w.date]);

            return {
                navn: participant.navn,
                vunnet: participantWinnings,
                avatar: participant.avatar
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching public data from Supabase:', error);
        res.status(500).json({ error: 'Could not fetch data from database' });
    }
});

// Get current data from Supabase (admin only)
app.get('/api/data', requireAuthAPI, async (req, res) => {
    try {
        const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .order('id', { ascending: true });

        if (participantsError) throw participantsError;

        const { data: winnings, error: winningsError } = await supabase
            .from('winnings')
            .select('*')
            .order('date', { ascending: true });

        if (winningsError) throw winningsError;

        const formattedData = participants.map(participant => {
            const participantWinnings = winnings
                .filter(w => w.participant_id === participant.id)
                .map(w => [w.amount, w.date]);

            return {
                navn: participant.navn,
                vunnet: participantWinnings,
                avatar: participant.avatar
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        res.status(500).json({ error: 'Could not fetch data from database' });
    }
});

// Save data to Supabase
app.post('/api/data', requireAuthAPI, async (req, res) => {
    try {
        const newData = req.body;

        await supabase.from('participants').delete().neq('id', 0);
        await supabase.from('winnings').delete().neq('id', 0);

        for (const person of newData) {
            const { data: participant, error: participantError } = await supabase
                .from('participants')
                .insert({
                    navn: person.navn,
                    avatar: person.avatar
                })
                .select()
                .single();

            if (participantError) throw participantError;

            if (person.vunnet && person.vunnet.length > 0) {
                const winningData = person.vunnet.map(winning => ({
                    participant_id: participant.id,
                    amount: winning[0],
                    date: winning[1]
                }));

                const { error: winningsError } = await supabase
                    .from('winnings')
                    .insert(winningData);

                if (winningsError) throw winningsError;
            }
        }

        console.log('✅ Data saved to Supabase successfully');
        res.json({ 
            success: true, 
            message: 'Data saved to database successfully'
        });
    } catch (error) {
        console.error('❌ Error saving data to Supabase:', error);
        res.status(500).json({ error: 'Could not save data to database' });
    }
});


// API endpoint to trigger migration manually
app.post('/api/migrate', requireAuthAPI, async (req, res) => {
    try {
        await migrateDataToSupabase();
        res.json({ success: true, message: 'Migration completed' });
    } catch (error) {
        res.status(500).json({ error: 'Migration failed: ' + error.message });
    }
});

app.listen(PORT, async () => {
    console.log(`🚀 Lottolista server running on http://localhost:${PORT}`);
    console.log(`📂 Admin interface: http://localhost:${PORT}/admin/`);
    console.log(`📄 Main page: http://localhost:${PORT}/`);
    console.log(`🗄️ Database: Supabase`);
    
    // Auto-migrate on startup
    await migrateDataToSupabase();
});