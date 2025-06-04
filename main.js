const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
// Add this near the top of your file
const path = require('path');
const { queryGameServerInfo } = require('steam-server-query');
const net = require('net');
const { promisify } = require('util');
const ping = require('ping');
	
dotenv.config();
	
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
	origin: ['http://localhost:3000', ''],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
}));
app.use(express.json());

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TrueQuickplay API is running' });
});

const CACHE_EXPIRATION = 5 * 60 * 1000;

let requestCounter = 0;

app.get('/api/servers', async (req, res) => {
  const requestId = ++requestCounter;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  console.log(`[${requestId}] Server request from ${clientIp} - ${new Date().toISOString()}`);
  console.log(`[${requestId}] User-Agent: ${userAgent}`);
  
  try {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();
    
    // Use cached data if available and not expired
    if (!forceRefresh && serverCache.data && (now - serverCache.timestamp < CACHE_EXPIRATION)) {
      console.log(`[${requestId}] Returning cached server data (age: ${Math.round((now - serverCache.timestamp) / 1000)}s)`);
      return res.status(200).json({ 
        servers: serverCache.data, 
        isMockData: serverCache.isMockData,
        fromCache: true,
        cacheAge: Math.round((now - serverCache.timestamp) / 1000) + ' seconds',
        requestId: requestId
      });
    }
	
	// Get the list of TF2 servers from Steam Master Server
    const steamApiKey = process.env.STEAM_API_KEY;
    const appId = 440; // TF2 App ID
    
    // Query the Steam Master Server API for servers with the tag
    const response = await axios.get('https://api.steampowered.com/IGameServersService/GetServerList/v1/', {
      params: {
        key: steamApiKey,
        filter: `\\appid\\${appId}\\gametagsand\\truequickplay`,
        limit: 100
      }
    });
  }
//end of current edit
