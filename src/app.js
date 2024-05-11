const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const https = require('https');
const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { fetchData, writeToFirebase, fetchWithRetry } = require('./functions');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());


// Programar el cron job para ejecutar cada segundo
const job = schedule.scheduleJob('*/2 * * * *', () => {
    const endpoints = ['armando', 'arnoldi', 'bounos', 'mallemacci', 'salcovsky', 'surwal', 'zz']
    console.log('Croneado pa');

    endpoints.forEach(endpoint => {
        fetchData(endpoint)
            .then((data) => {
                fetchWithRetry(endpoint)
                console.log(`Datos de ${endpoint}:`, data);
            })
            .catch((error) => {
                console.error(`Error al obtener los datos:`, error);
            });
    });
});

module.exports = app;