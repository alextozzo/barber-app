const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require('./navalha-dor-firebase-adminsdk-fbsvc-d0e79dd05e.json');

initializeApp({
  credential: cert(serviceAccount)
});

const uid = 'OGnzmU3dIGeHFIBUSgUj0z1xoW22';

getAuth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✅ Admin marcado com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  });