const {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} = require("firebase/firestore");
const https = require("https");
const { db } = require("./firebaseConfig");

const MAX_ATTEMPTS = 6;

const fetchWithRetry = async (endpoint, attempts = 0) => {
  try {
    const data = await fetchData(endpoint);
    writeToFirebase(data, endpoint);
  } catch (error) {
    if (attempts < MAX_ATTEMPTS - 1) {
      console.error(
        `Error al obtener los datos de ${endpoint}. Intento ${
          attempts + 1
        } de ${MAX_ATTEMPTS}.`
      );
      setTimeout(() => {
        fetchWithRetry(endpoint, attempts + 1);
      }, 5000); // Esperar 5 segundos antes de volver a intentar
    } else {
      console.error(
        `Error al obtener los datos de ${endpoint} después de ${MAX_ATTEMPTS} intentos.`,
        error
      );
    }
  }
};

const fetchData = (endpoint) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "scrapp-delta.vercel.app",
      port: 443,
      path: `/${endpoint}`,
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

const writeToFirebase = async (data) => {
  const collectionRef = collection(db, "alquileres");
  const createdAt = serverTimestamp();

  try {
    const promises = data.map(async (item) => {
      return addDoc(collectionRef, {
        ...item,
        timeStamp: createdAt,
      });
    });

    await Promise.all(promises);
    console.log(`Datos guardados`);
  } catch (error) {
    console.error("Error al guardar datos en Firebase:", error);
  }
};

const deleteCollection = async () => {
  try {
    const collectionRef = collection(db, 'alquileres');
    const querySnapshot = await getDocs(collectionRef);

    const promises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(promises);
    console.log(`Colección eliminada correctamente.`);
  } catch (error) {
    console.error("Error al eliminar la colección:", error);
  }
};

const fetchWakeUpServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cron-scrapper.onrender.com',
      port: 443,
      path: '/wakeUp',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};


module.exports = {
  fetchData,
  writeToFirebase,
  fetchWithRetry,
  deleteCollection,
  fetchWakeUpServer
};
