/**
 * Firestore Initialization Script
 * Script para inicializar las colecciones de Firestore con datos base
 */

import {
    collection,
    doc,
    setDoc,
    getDocs,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore'
import { db } from './config'
import { MOCK_CATEGORIES } from '@/data/categories.data'
import { MOCK_TAGS } from '@/data/tags.data'
import { MOCK_POSTS } from '@/data/posts.data'
import type { Category, Tag, BlogPost } from '@/types/blog.types'

/**
 * Verificar si una colección está vacía
 */
async function isCollectionEmpty(collectionName: string): Promise<boolean> {
    try {
        const snapshot = await getDocs(collection(db, collectionName))
        return snapshot.empty
    } catch (error) {
        console.error(`Error al verificar colección ${collectionName}:`, error)
        return true
    }
}

/**
 * Inicializar colección de categorías
 */
export async function initCategories(): Promise<void> {
    console.log('📁 Inicializando categorías...')

    const isEmpty = await isCollectionEmpty('categories')
    if (!isEmpty) {
        console.log('⏭️ Las categorías ya existen, saltando...')
        return
    }

    const batch = writeBatch(db)
    const categoriesRef = collection(db, 'categories')

    MOCK_CATEGORIES.forEach((category: Category) => {
        const docRef = doc(categoriesRef, category.id)
        batch.set(docRef, {
            name: category.name,
            slug: category.slug,
            color: category.color,
            description: category.description || '',
            icon: category.icon || 'folder',
            createdAt: serverTimestamp(),
        })
    })

    await batch.commit()
    console.log(`✅ ${MOCK_CATEGORIES.length} categorías creadas`)
}

/**
 * Inicializar colección de tags
 */
export async function initTags(): Promise<void> {
    console.log('🏷️ Inicializando tags...')

    const isEmpty = await isCollectionEmpty('tags')
    if (!isEmpty) {
        console.log('⏭️ Los tags ya existen, saltando...')
        return
    }

    const batch = writeBatch(db)
    const tagsRef = collection(db, 'tags')

    MOCK_TAGS.forEach((tag: Tag) => {
        const docRef = doc(tagsRef, tag.id)
        batch.set(docRef, {
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
            createdAt: serverTimestamp(),
        })
    })

    await batch.commit()
    console.log(`✅ ${MOCK_TAGS.length} tags creados`)
}

/**
 * Inicializar colección de posts
 */
export async function initPosts(): Promise<void> {
    console.log('📝 Inicializando posts...')

    const isEmpty = await isCollectionEmpty('posts')
    if (!isEmpty) {
        console.log('⏭️ Los posts ya existen, saltando...')
        return
    }

    const batch = writeBatch(db)
    const postsRef = collection(db, 'posts')

    MOCK_POSTS.forEach((post: BlogPost) => {
        const docRef = doc(postsRef, post.id)

        // Convertir el post a formato Firestore
        batch.set(docRef, {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            // Guardar solo IDs de relaciones
            authorId: post.author.id,
            categoryId: post.category?.id || null,
            tagIds: post.tags?.map(tag => tag.id) || [],
            // Metadata
            publishedAt: post.publishedAt,
            createdAt: serverTimestamp(),
            updatedAt: post.updatedAt || null,
            featuredImage: post.featuredImage || '',
            readingTime: post.readingTime || 5,
            // Estado
            status: post.status || 'published',
            isPublished: post.isPublished ?? true,
            isFeatured: post.isFeatured ?? false,
            // Métricas
            likes: post.likes || 0,
            views: post.views || 0,
            commentsCount: post.commentsCount || 0,
        })
    })

    await batch.commit()
    console.log(`✅ ${MOCK_POSTS.length} posts creados`)
}

/**
 * Inicializar colección de usuarios (estructura base)
 */
export async function initUsersCollection(): Promise<void> {
    console.log('👥 Verificando colección de usuarios...')

    // Solo verificamos que exista, los usuarios se crean con Auth
    const isEmpty = await isCollectionEmpty('users')

    if (isEmpty) {
        console.log('ℹ️ La colección de usuarios está vacía (se poblará con el registro)')
    } else {
        const snapshot = await getDocs(collection(db, 'users'))
        console.log(`✅ ${snapshot.size} usuarios encontrados`)
    }
}

/**
 * Inicializar colección de configuración del sitio
 */
export async function initSiteSettings(): Promise<void> {
    console.log('⚙️ Inicializando configuración del sitio...')

    const settingsRef = doc(db, 'settings', 'site')

    await setDoc(settingsRef, {
        siteName: 'Portfolio Personal',
        siteDescription: 'Blog personal de desarrollo web y tecnología',
        siteUrl: 'https://tu-sitio.netlify.app',
        author: {
            name: 'Tu Nombre',
            email: 'tu@email.com',
            bio: 'Desarrollador Full Stack',
        },
        social: {
            github: 'https://github.com/tuusuario',
            linkedin: 'https://linkedin.com/in/tuusuario',
            twitter: 'https://twitter.com/tuusuario',
        },
        features: {
            comments: true,
            likes: true,
            newsletter: false,
        },
        updatedAt: serverTimestamp(),
    }, { merge: true })

    console.log('✅ Configuración del sitio creada')
}

/**
 * Función principal para inicializar Firestore
 */
export async function initializeFirestore(): Promise<void> {
    console.log('🚀 Iniciando configuración de Firestore...\n')

    try {
        // Inicializar en orden (respetando dependencias)
        await initCategories()
        await initTags()
        await initPosts()
        await initUsersCollection()
        await initSiteSettings()

        console.log('\n✅ Firestore inicializado correctamente!')
        console.log('📊 Resumen:')
        console.log(`   - ${MOCK_CATEGORIES.length} categorías`)
        console.log(`   - ${MOCK_TAGS.length} tags`)
        console.log(`   - ${MOCK_POSTS.length} posts`)
        console.log('   - Configuración del sitio')

    } catch (error) {
        console.error('❌ Error al inicializar Firestore:', error)
        throw error
    }
}

/**
 * Verificar estado de Firestore
 */
export async function checkFirestoreStatus(): Promise<{
    categories: number
    tags: number
    posts: number
    users: number
}> {
    console.log('🔍 Verificando estado de Firestore...\n')

    const categoriesSnapshot = await getDocs(collection(db, 'categories'))
    const tagsSnapshot = await getDocs(collection(db, 'tags'))
    const postsSnapshot = await getDocs(collection(db, 'posts'))
    const usersSnapshot = await getDocs(collection(db, 'users'))

    const status = {
        categories: categoriesSnapshot.size,
        tags: tagsSnapshot.size,
        posts: postsSnapshot.size,
        users: usersSnapshot.size,
    }

    console.log('📊 Estado actual:')
    console.log(`   - Categorías: ${status.categories}`)
    console.log(`   - Tags: ${status.tags}`)
    console.log(`   - Posts: ${status.posts}`)
    console.log(`   - Usuarios: ${status.users}`)

    return status
}
