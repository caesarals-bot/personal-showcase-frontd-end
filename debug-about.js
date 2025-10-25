// Script temporal para verificar datos About en Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Configuración de Firebase (usar las mismas variables de entorno)
const firebaseConfig = {
  apiKey: "AIzaSyBJqQgOOJJOJJOJJOJJOJJOJJOJJOJJOJJO", // Placeholder - usar .env
  authDomain: "personal-page-showcase.firebaseapp.com",
  projectId: "personal-page-showcase",
  storageBucket: "personal-page-showcase.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAboutData() {
  try {
    console.log('🔍 Verificando datos About en Firebase...');
    
    const docRef = doc(db, 'about', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Datos encontrados en Firebase:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.sections) {
        console.log(`📊 Número de secciones: ${data.sections.length}`);
        data.sections.forEach((section, index) => {
          console.log(`📝 Sección ${index + 1}:`);
          console.log(`   - ID: ${section.id}`);
          console.log(`   - Título: ${section.title}`);
          console.log(`   - Imagen: ${section.image || 'Sin imagen'}`);
          console.log(`   - Posición: ${section.imagePosition}`);
        });
      }
    } else {
      console.log('❌ No se encontraron datos About en Firebase');
      console.log('📍 Documento: about/data no existe');
    }
  } catch (error) {
    console.error('❌ Error al verificar datos About:', error);
  }
}

// Ejecutar verificación
checkAboutData();