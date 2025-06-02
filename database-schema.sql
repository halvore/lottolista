-- Supabase SQL schema for Lottolista
-- Run this in your Supabase SQL editor

-- Create table for participants
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  navn VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for winnings
CREATE TABLE IF NOT EXISTS winnings (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_winnings_participant_id ON winnings(participant_id);
CREATE INDEX IF NOT EXISTS idx_winnings_date ON winnings(date);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE winnings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on participants" ON participants FOR ALL USING (true);
CREATE POLICY "Allow all operations on winnings" ON winnings FOR ALL USING (true);