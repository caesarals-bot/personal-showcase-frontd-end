// Script para reemplazar URLs problemáticas con alternativas de Unsplash
// Ejecutar en la consola del navegador después de identificar las URLs problemáticas

// Alternativas de Unsplash para reemplazar las URLs problemáticas
const unsplashAlternatives = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', // Computadora/programación
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c', // Código en pantalla
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085', // Laptop con código
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713', // Código JavaScript
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd', // Tecnología/API
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31', // Tecnología moderna
  'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a', // Desarrollo web
  'https://images.unsplash.com/photo-1581276879432-15e50529f34b', // React/Frontend
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3', // Desarrollo de software
  'https://images.unsplash.com/photo-1573495627361-d9b87960b12d'  // Tecnología/Innovación
];

function fixBrokenImageUrls() {
  console.log('🔧 Iniciando reparación de URLs de imágenes...');
  
  // Verificar si tenemos datos de URLs problemáticas
  if (!window.problematicUrls || !window.postsData) {
    console.error('❌ No se encontraron datos de URLs problemáticas. Ejecuta primero el script de diagnóstico.');
    return;
  }
  
  const problematicUrls = window.problematicUrls;
  const posts = window.postsData;
  
  console.log(`📊 Encontradas ${problematicUrls.length} URLs problemáticas para reparar.`);
  
  // Crear un mapa de reemplazo para cada URL problemática
  const replacementMap = {};
  problematicUrls.forEach((item, index) => {
    // Seleccionar una alternativa de Unsplash (rotando por el array)
    const alternativeIndex = index % unsplashAlternatives.length;
    const newUrl = unsplashAlternatives[alternativeIndex];
    
    replacementMap[item.url] = newUrl;
    
    console.log(`🔄 Reemplazando: ${item.url}`);
    console.log(`   Por: ${newUrl}`);
  });
  
  // Aplicar los reemplazos a los posts
  posts.forEach(post => {
    // Reemplazar featuredImage si es necesario
    if (post.featuredImage && replacementMap[post.featuredImage]) {
      post.featuredImage = replacementMap[post.featuredImage];
    }
    
    // Reemplazar URLs en gallery si es necesario
    if (post.gallery && Array.isArray(post.gallery)) {
      post.gallery = post.gallery.map(url => replacementMap[url] || url);
    }
  });
  
  // Guardar los posts actualizados en localStorage
  const localStorageKey = 'personal-page-posts';
  localStorage.setItem(localStorageKey, JSON.stringify(posts));
  
  console.log('✅ URLs reemplazadas y datos guardados en localStorage.');
  console.log('🔄 Recarga la página para ver los cambios.');
  
  // Guardar una copia de los posts reparados para referencia
  window.fixedPostsData = posts;
  
  return {
    replacedUrls: replacementMap,
    fixedPosts: posts
  };
}

// Para ejecutar la reparación, llama a esta función en la consola:
// fixBrokenImageUrls();