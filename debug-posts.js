// Script para encontrar URLs problemáticas - Ejecutar en la consola del navegador
console.log('🔍 Buscando URLs problemáticas en localStorage...');

// Verificar localStorage
const localStorageKey = 'personal-page-posts';
const storedPosts = localStorage.getItem(localStorageKey);

if (storedPosts) {
    console.log('📦 Datos encontrados en localStorage');
    try {
        const posts = JSON.parse(storedPosts);
        console.log(`📊 Total de posts: ${posts.length}`);
        
        // Buscar URLs problemáticas
        const problematicUrls = [];
        
        posts.forEach((post, index) => {
            // Verificar featuredImage
            if (post.featuredImage) {
                if (post.featuredImage.includes('imgur.com') || post.featuredImage.includes('nttdata.com')) {
                    problematicUrls.push({
                        postId: post.id,
                        postTitle: post.title,
                        type: 'featuredImage',
                        url: post.featuredImage,
                        index: index
                    });
                }
            }
            
            // Verificar gallery
            if (post.gallery && Array.isArray(post.gallery)) {
                post.gallery.forEach((imageUrl, galleryIndex) => {
                    if (imageUrl.includes('imgur.com') || imageUrl.includes('nttdata.com')) {
                        problematicUrls.push({
                            postId: post.id,
                            postTitle: post.title,
                            type: 'gallery',
                            url: imageUrl,
                            index: index,
                            galleryIndex: galleryIndex
                        });
                    }
                });
            }
        });
        
        if (problematicUrls.length > 0) {
            console.log('🚨 URLs problemáticas encontradas:');
            problematicUrls.forEach(item => {
                console.log(`- Post: "${item.postTitle}" (ID: ${item.postId})`);
                console.log(`  Tipo: ${item.type}`);
                console.log(`  URL: ${item.url}`);
                console.log('---');
            });
            
            // Guardar para uso posterior
            window.problematicUrls = problematicUrls;
            window.postsData = posts;
            
            console.log('💾 Datos guardados en window.problematicUrls y window.postsData');
        } else {
            console.log('✅ No se encontraron URLs problemáticas');
        }
        
    } catch (error) {
        console.error('❌ Error al parsear datos:', error);
    }
} else {
    console.log('📭 No hay datos en localStorage con la clave:', localStorageKey);
    console.log('🔍 Verificando otras claves posibles...');
    
    // Buscar otras claves que puedan contener posts
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('post') || key.includes('blog'))) {
            console.log(`📝 Clave encontrada: ${key}`);
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0 && data[0].title) {
                    console.log(`  📊 Contiene ${data.length} posts`);
                }
            } catch (e) {
                console.log(`  ❌ No es JSON válido`);
            }
        }
    }
}

console.log('🔍 Búsqueda completada.');