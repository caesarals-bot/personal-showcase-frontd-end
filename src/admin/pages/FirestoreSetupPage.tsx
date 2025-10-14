/**
 * Firestore Setup Page
 * Página de administración para inicializar y gestionar Firestore
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  initializeFirestore, 
  checkFirestoreStatus,
  initCategories,
  initTags,
  initPosts,
  initSiteSettings
} from '@/firebase/initFirestore'

interface FirestoreStatus {
  categories: number
  tags: number
  posts: number
  users: number
}

export default function FirestoreSetupPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<FirestoreStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Interceptar console.log para mostrar en la UI
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  // Verificar estado actual
  const handleCheckStatus = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    
    try {
      addLog('Verificando estado de Firestore...')
      const currentStatus = await checkFirestoreStatus()
      setStatus(currentStatus)
      addLog('✅ Estado verificado correctamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Inicializar todo
  const handleInitializeAll = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setLogs([])
    
    try {
      addLog('🚀 Iniciando configuración completa...')
      await initializeFirestore()
      addLog('✅ Firestore inicializado correctamente')
      setSuccess('Firestore inicializado con éxito!')
      
      // Actualizar estado
      const currentStatus = await checkFirestoreStatus()
      setStatus(currentStatus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Inicializar solo categorías
  const handleInitCategories = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    
    try {
      addLog('📁 Inicializando categorías...')
      await initCategories()
      addLog('✅ Categorías creadas')
      await handleCheckStatus()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Inicializar solo tags
  const handleInitTags = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    
    try {
      addLog('🏷️ Inicializando tags...')
      await initTags()
      addLog('✅ Tags creados')
      await handleCheckStatus()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Inicializar solo posts
  const handleInitPosts = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    
    try {
      addLog('📝 Inicializando posts...')
      await initPosts()
      addLog('✅ Posts creados')
      await handleCheckStatus()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Inicializar configuración
  const handleInitSettings = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    
    try {
      addLog('⚙️ Inicializando configuración...')
      await initSiteSettings()
      addLog('✅ Configuración creada')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      addLog(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8" />
          Configuración de Firestore
        </h1>
        <p className="text-muted-foreground mt-2">
          Inicializa y gestiona las colecciones de Firestore
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Éxito</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual</CardTitle>
          <CardDescription>
            Documentos en cada colección de Firestore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{status?.categories ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{status?.tags ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Tags</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{status?.posts ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{status?.users ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Usuarios</div>
            </div>
          </div>

          <Button 
            onClick={handleCheckStatus} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Estado
          </Button>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Inicialización</CardTitle>
          <CardDescription>
            Crea las colecciones y pobla con datos iniciales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inicializar todo */}
          <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Inicializar Todo
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea todas las colecciones y pobla con datos de ejemplo
                </p>
              </div>
              <Button 
                onClick={handleInitializeAll} 
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Ejecutar'
                )}
              </Button>
            </div>
          </div>

          {/* Acciones individuales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Categorías</h3>
              <Button 
                onClick={handleInitCategories} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Inicializar
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tags</h3>
              <Button 
                onClick={handleInitTags} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Inicializar
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Posts</h3>
              <Button 
                onClick={handleInitPosts} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Inicializar
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Configuración</h3>
              <Button 
                onClick={handleInitSettings} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Inicializar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registro de Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advertencia */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Las operaciones de inicialización solo crean datos si las colecciones están vacías.
          No se duplicarán los datos si ejecutas el proceso varias veces.
        </AlertDescription>
      </Alert>
    </div>
  )
}
