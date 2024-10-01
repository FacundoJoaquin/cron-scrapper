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

function logUTCTime() {
  const now = new Date();
  const utcTime = now.toUTCString();
  console.log(`Hora UTC actual: ${utcTime}`);
}

const job = schedule.scheduleJob('0 */18 * * *', () => {
  try {
    deleteCollection();
    console.log('Colección borrada con éxito');
  } catch (error) {
    console.error('Error: ' + error);
  }

  setTimeout(() => {
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
  }, 45000); // 45 segundos = 45000 milisegundos
});


const serverWakeUp = schedule.scheduleJob('*/14 * * * *', async () => {
  try {
    const res = await fetchWakeUpServer();
    logUTCTime();
    console.log(res)
  } catch (error) {
    console.error('Error: ' + error)
  }
});


/* const jobDelete = schedule.scheduleJob('18 18 * * *', () => {
  try {
  deleteCollection();
    console.log('Coleccion borrada con éxito')
  } catch (error) {
    console.error('Error: ' + error)
  }
});

const job = schedule.scheduleJob('20 18 * * *', () => {
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
 */
module.exports = app;