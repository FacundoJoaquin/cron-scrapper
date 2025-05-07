const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const https = require('https');
const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { fetchData, writeToFirebase, fetchWithRetry, deleteCollection, fetchWakeUpServer } = require('./functions');
const { db } = require('./firebaseConfig');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/wakeUp', (req, res) => {
  res.json({response: 'Api is working.'});
});

// Test endpoint for manually testing Firebase connectivity
app.get('/test-firebase', async (req, res) => {
  try {
    const collectionRef = collection(db, "test-collection");
    await addDoc(collectionRef, {
      test: true,
      timestamp: serverTimestamp(),
      message: "This is a test document created on " + new Date().toISOString()
    });
    res.json({ success: true, message: "Test document successfully written to Firebase" });
  } catch (error) {
    console.error(`Error writing test document to Firebase:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual trigger for the wake-up job
app.get('/trigger-wakeup', async (req, res) => {
  try {
    const result = await fetchWakeUpServer();
    res.json({ success: true, message: "Wake-up job executed successfully", result });
  } catch (error) {
    console.error(`Error executing wake-up job:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual trigger for data collection job
app.get('/trigger-data-collection', async (req, res) => {
  res.json({ success: true, message: "Data collection job started" });
  
  try {
    await deleteCollection();
    
    const endpoints = ['armando', 'arnoldi', 'bounos', 'mallemacci', 'salcovsky', 'surwal', 'zz'];
    
    // Create an array of promises for each endpoint
    const endpointPromises = endpoints.map(endpoint => {
      return new Promise(async (resolve) => {
        try {
          await fetchWithRetry(endpoint);
          resolve({ endpoint, success: true });
        } catch (error) {
          console.error(`Error processing endpoint ${endpoint}:`, error);
          resolve({ endpoint, success: false, error: error.message });
        }
      });
    });
    
    // Process all endpoints in parallel and wait for all to complete, regardless of success/failure
    const results = await Promise.allSettled(endpointPromises);
    
    // Log summary of results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = endpoints.length - successful;
    
    console.log(`Data collection completed. Results: ${successful} successful, ${failed} failed`);
  } catch (error) {
    console.error(`Error in data collection job:`, error);
  }
});

// POST endpoint to delete the entire collection
app.post('/delete-collection', async (req, res) => {
  try {
    await deleteCollection();
    res.json({ success: true, message: "Collection successfully deleted" });
  } catch (error) {
    console.error(`Error deleting collection:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function logUTCTime() {
  const now = new Date();
  const utcTime = now.toUTCString();
  console.log(`Hora UTC actual: ${utcTime}`);
}

const job = schedule.scheduleJob('0 */18 * * *', () => {
  try {
    deleteCollection();
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  setTimeout(async () => {
    const endpoints = ['armando', 'arnoldi', 'bounos', 'mallemacci', 'salcovsky', 'surwal', 'zz'];
    
    // Create an array of promises for each endpoint
    const endpointPromises = endpoints.map(endpoint => {
      return new Promise(async (resolve) => {
        try {
          await fetchWithRetry(endpoint);
          resolve({ endpoint, success: true });
        } catch (error) {
          console.error(`Error al obtener los datos para ${endpoint}:`, error);
          resolve({ endpoint, success: false, error: error.message });
        }
      });
    });
    
    // Process all endpoints in parallel and wait for all to complete
    const results = await Promise.allSettled(endpointPromises);
    
    // Log summary of results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = endpoints.length - successful;
    
    console.log(`Data collection completed. Results: ${successful} successful, ${failed} failed`);
  }, 45000); // 45 segundos = 45000 milisegundos
});

let count = 0;
const serverWakeUp = schedule.scheduleJob('*/40 * * * * *', async () => {
  try {
    const res = await fetchWakeUpServer();
    logUTCTime();
    count++;
    console.log(`Wake-up count: ${count}`);
  } catch (error) {
    console.error(`Error in wake-up job:`, error);
  }
});

module.exports = app;