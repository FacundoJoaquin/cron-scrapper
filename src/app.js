const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const https = require('https');
const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { fetchData, writeToFirebase, fetchWithRetry, deleteCollection, fetchWakeUpServer } = require('./functions');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

app.get('/wakeUp', (req, res) => {
  res.json({response: 'Api is working.'});
});

const serverWakeUp = schedule.scheduleJob('*/14 * * * *', async () => {
  try {
    const res = await fetchWakeUpServer();
    console.log(res)
  } catch (error) {
    console.error('Error: ' + error)
  }
});


const jobDelete = schedule.scheduleJob('44 09 * * *', () => {
  try {
  deleteCollection();
    console.log('Coleccion borrada con éxito')
  } catch (error) {
    console.error('Error: ' + error)
  }
});

const job = schedule.scheduleJob('46 09 * * *', () => {
    const endpoints = ['armando', 'arnoldi', 'bounos', 'mallemacci', 'salcovsky', 'surwal', 'zz'];
    endpoints.forEach(endpoint => {
      fetchWithRetry(endpoint)
        .then((data) => {
          console.log(`Datos OK`);
        })
        .catch((error) => {
          console.error(`Error al obtener los datos:`, error);
        });
    });
  });

module.exports = app;