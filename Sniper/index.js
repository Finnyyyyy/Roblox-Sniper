const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Store for active signals with auto-cleanup
let queue = [];
const MAX_QUEUE_AGE = 30000; // 30 seconds

// Clean old signals periodically
setInterval(() => {
    const now = Date.now();
    queue = queue.filter(signal => {
        const signalAge = now - (signal.timestamp || now);
        return signalAge < MAX_QUEUE_AGE;
    });
}, 10000); // Clean every 10 seconds

app.post("/message", (req, res) => {
    const signal = {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        receivedAt: new Date().toISOString()
    };
    
    queue.push(signal);
    console.log("📨 Received from Roblox:", signal);
    res.json({ 
        status: "received", 
        id: signal.id,
        message: "Signal stored for Tampermonkey",
        queueLength: queue.length
    });
});

// New endpoint for Tampermonkey to get all active signals
app.get("/signals", (req, res) => {
    res.json({ 
        signals: queue,
        total: queue.length
    });
});

// Keep your existing /next endpoint for compatibility
app.get("/next", (req, res) => {
    if (queue.length > 0) {
        res.json(queue.shift());
    } else {
        res.json(null);
    }
});

// New endpoint for Tampermonkey to confirm receipt and remove signal
app.delete("/signal/:id", (req, res) => {
    const initialLength = queue.length;
    queue = queue.filter(signal => signal.id !== req.params.id);
    const deleted = initialLength > queue.length;
    
    res.json({ 
        deleted,
        removedId: req.params.id,
        queueLength: queue.length
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy",
        queueLength: queue.length,
        uptime: process.uptime()
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Railway Bridge running on port ${port}`));
