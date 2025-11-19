# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select your preferred region
4. Click "Create Cluster"

### Step 3: Setup Database Access
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose username/password authentication
4. Create user (save credentials!)
5. Set privileges to "Atlas Admin"

### Step 4: Setup Network Access
1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Or add your specific IP address

### Step 5: Get Connection String
1. Go to "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/ai-mock-interviewer?retryWrites=true&w=majority`

### Step 6: Update .env File
```env
MONGODB_URI=mongodb+srv://username:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/ai-mock-interviewer?retryWrites=true&w=majority
PORT=5000
```

**Important:** Replace `<password>` with your actual password!

---

## Option 2: Local MongoDB Installation

### Windows

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download Windows installer (.msi)

2. **Install MongoDB:**
   ```powershell
   # Run the installer
   # Choose "Complete" installation
   # Install MongoDB as a Service (recommended)
   ```

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service:**
   ```powershell
   # MongoDB should auto-start as a service
   # Or manually start:
   net start MongoDB
   ```

5. **Update .env File:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-mock-interviewer
   PORT=5000
   ```

### macOS

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Verify Connection

### Test with Node.js
```powershell
cd backend
node -e "const mongoose = require('mongoose'); const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test'; mongoose.connect(uri).then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch((err) => { console.log('✗ Connection failed:', err.message); process.exit(1); });"
```

### Expected Output
```
✓ MongoDB connected
```

---

## Seed the Database

Once MongoDB is connected, run:

```powershell
cd backend
npm run seed
```

### Expected Output
```
Attempting to connect to MongoDB...
✓ Connected to MongoDB
✓ Cleared existing questions
✓ Inserted 10 questions

✓ Database seeded successfully!
=================================
HR Questions: 3
Technical Questions: 4
Behavioral Questions: 3
Total Questions: 10
=================================

✓ Database connection closed
```

---

## Troubleshooting

### Error: connect ECONNREFUSED
**Cause:** MongoDB is not running

**Solution:**
- **Windows:** `net start MongoDB`
- **macOS:** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

### Error: Authentication failed
**Cause:** Wrong username/password in connection string

**Solution:**
- Check MongoDB Atlas credentials
- Ensure password doesn't contain special characters (or URL-encode them)
- Verify user has correct permissions

### Error: Network timeout
**Cause:** IP not whitelisted in MongoDB Atlas

**Solution:**
- Go to Network Access in Atlas
- Add your IP address or use 0.0.0.0/0

### Error: Invalid connection string
**Cause:** Malformed MONGODB_URI

**Solution:**
- Local: `mongodb://localhost:27017/ai-mock-interviewer`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

---

## Using MongoDB Compass (GUI Tool)

1. Download from: https://www.mongodb.com/try/download/compass
2. Install and open
3. Use connection string from .env
4. Browse collections visually

---

## Quick Start (No MongoDB)

The frontend interview feature works without MongoDB (uses Web Speech API). To run without database:

1. Keep `.env` with placeholder:
   ```env
   MONGODB_URI=YOUR_MONGODB_URI_HERE
   PORT=5000
   ```

2. Server will start and skip database connection
3. Question bank features won't work, but live interview will

---

## Next Steps

After MongoDB is connected:

1. **Seed the database:**
   ```powershell
   npm run seed
   ```

2. **Test API endpoints:**
   ```powershell
   # Get all questions
   Invoke-RestMethod -Uri "http://localhost:5000/api/questions"
   
   # Create session
   Invoke-RestMethod -Uri "http://localhost:5000/api/sessions" -Method Post -Body '{"candidateName":"Test User"}' -ContentType "application/json"
   ```

3. **View data in MongoDB Compass** (optional)
