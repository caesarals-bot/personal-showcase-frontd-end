// Script para probar el sistema de fallback de imágenes
// Ejecutar en la consola del navegador

console.log('🧪 Iniciando prueba del sistema de fallback de imágenes...');

// Función para simular URLs rotas
function testFallbackSystem() {
  // URLs problemáticas para probar
  const brokenUrls = [
    'https://i.stack.imgur.com/broken-url.png',
    'https://www.nttdata.com/broken-image.jpg',
    'https://example.com/non-existent-image.png'
  ];

  console.log('📋 URLs de prueba:', brokenUrls);

  // Buscar todas las imágenes en la página
  const images = document.querySelectorAll('img');
  console.log(`🖼️ Encontradas ${images.length} imágenes en la página`);

  // Cambiar algunas imágenes a URLs rotas para probar el fallback
  let testCount = 0;
  images.forEach((img, index) => {
    if (testCount < 3 && img.src && !img.src.includes('data:')) {
      const originalSrc = img.src;
      const brokenUrl = brokenUrls[testCount % brokenUrls.length];
      
      console.log(`🔄 Cambiando imagen ${index + 1}:`);
      console.log(`   Original: ${originalSrc}`);
      console.log(`   Rota: ${brokenUrl}`);
      
      img.src = brokenUrl;
      testCount++;
    }
  });

  console.log(`✅ Se cambiaron ${testCount} imágenes a URLs rotas`);
  console.log('⏳ Esperando a que se active el sistema de fallback...');
  
  // Verificar el estado después de un momento
  setTimeout(() => {
    const fallbackElements = document.querySelectorAll('[class*="bg-gray-100"], [class*="bg-gray-800"]');
    console.log(`🎯 Elementos de fallback detectados: ${fallbackElements.length}`);
    
    fallbackElements.forEach((element, index) => {
      const textContent = element.textContent;
      if (textContent.includes('Sin Imagen') || textContent.includes('Próximamente')) {
        console.log(`✅ Fallback ${index + 1} funcionando correctamente: "${textContent.trim()}"`);
      }
    });
    
    console.log('🏁 Prueba completada. Revisa visualmente las imágenes en la página.');
  }, 3000);
}

// Ejecutar la prueba
testFallbackSystem();