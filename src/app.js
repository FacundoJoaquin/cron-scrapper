const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const https = require('https');
const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { fetchData, writeToFirebase, fetchWithRetry, deleteCollection } = require('./functions');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());


const jobDelete = schedule.scheduleJob('58 4 * * *', () => {
  try {
  deleteCollection();
    console.log('Coleccion borrada con éxito')
  } catch (error) {
    console.error('Error: ' + error)
  }
});

const job = schedule.scheduleJob('0 5 * * *', () => {
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