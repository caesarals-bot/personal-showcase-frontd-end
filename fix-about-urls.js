/**
 * Script para limpiar URLs incorrectas de imágenes de about
 * Reemplaza URLs con carpeta 'about/' por 'about-images/'
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Configuración de Firebase (hardcoded para el script)
const firebaseConfig = {
    apiKey: "AIzaSyBupQc--IDMqdfHDp-dRDXh7LUARn-TPHI",
    authDomain: "my-page-showcase.firebaseapp.com",
    projectId: "my-page-showcase",
    storageBucket: "my-page-showcase.firebasestorage.app",
    messagingSenderId: "84431372085",
    appId: "1:84431372085:web:487a6dcf057e3aaab8567c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Función para corregir URLs de about
 */
function fixAboutUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    // Buscar el patrón incorrecto: about%2F o about/
    const incorrectPatterns = [
        /about%2F/g,  // URL encoded
        /about\//g    // Normal
    ];
    
    let fixedUrl = url;
    
    // Reemplazar con el patrón correcto
    incorrectPatterns.forEach(pattern => {
        if (pattern.test(fixedUrl)) {
            fixedUrl = fixedUrl.replace(pattern, 'about-images%2F');
            console.log(`🔧 URL corregida: ${url} → ${fixedUrl}`);
        }
    });
    
    return fixedUrl;
}

/**
 * Función principal para limpiar la base de datos
 */
async function cleanAboutUrls() {
    console.log('🚀 Iniciando limpieza de URLs de about...\n');
    
    try {
        // Obtener todos los documentos de about
        const aboutCollection = collection(db, 'about');
        const aboutSnapshot = await getDocs(aboutCollection);
        
        let totalDocuments = 0;
        let documentsUpdated = 0;
        let urlsFixed = 0;
        
        console.log(`📄 Encontrados ${aboutSnapshot.size} documentos en la colección 'about'\n`);
        
        // Procesar cada documento
        for (const docSnapshot of aboutSnapshot.docs) {
            totalDocuments++;
            const docData = docSnapshot.data();
            const docId = docSnapshot.id;
            
            console.log(`📋 Procesando documento: ${docId}`);
            
            let hasChanges = false;
            const updatedData = { ...docData };
            
            // Verificar si hay secciones
            if (docData.sections && Array.isArray(docData.sections)) {
                console.log(`   📝 Encontradas ${docData.sections.length} secciones`);
                
                updatedData.sections = docData.sections.map((section, index) => {
                    const updatedSection = { ...section };
                    
                    // Verificar y corregir la URL de imagen
                    if (section.image) {
                        const originalUrl = section.image;
                        const fixedUrl = fixAboutUrl(originalUrl);
                        
                        if (fixedUrl !== originalUrl) {
                            updatedSection.image = fixedUrl;
                            hasChanges = true;
                            urlsFixed++;
                            console.log(`   ✅ Sección ${index + 1}: URL corregida`);
                        } else {
                            console.log(`   ⚪ Sección ${index + 1}: URL ya es correcta`);
                        }
                    } else {
                        console.log(`   ⚪ Sección ${index + 1}: Sin imagen`);
                    }
                    
                    return updatedSection;
                });
            }
            
            // Actualizar el documento si hay cambios
            if (hasChanges) {
                const docRef = doc(db, 'about', docId);
                await updateDoc(docRef, updatedData);
                documentsUpdated++;
                console.log(`   💾 Documento actualizado\n`);
            } else {
                console.log(`   ⚪ Sin cambios necesarios\n`);
            }
        }
        
        // Resumen final
        console.log('🎉 Limpieza completada!');
        console.log(`📊 Resumen:`);
        console.log(`   • Documentos procesados: ${totalDocuments}`);
        console.log(`   • Documentos actualizados: ${documentsUpdated}`);
        console.log(`   • URLs corregidas: ${urlsFixed}`);
        
        if (urlsFixed > 0) {
            console.log('\n✨ Las URLs incorrectas han sido corregidas.');
            console.log('🔄 Refresca la página para ver los cambios.');
        } else {
            console.log('\n✅ No se encontraron URLs incorrectas.');
        }
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        process.exit(1);
    }
}

// Ejecutar el script
cleanAboutUrls()
    .then(() => {
        console.log('\n🏁 Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });