/**
 * Firestore Setup Page
 * Página de administración para inicializar y gestionar Firestore
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
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
  checkFirestoreStatus
} from '@/firebase/initFirestore'

interface FirestoreStatus {
  categories: number
  tags: number
  posts: number
  users: number
  portfolio: number
}

export default function FirestoreSetupPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<FirestoreStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success] = useState<string | null>(null)
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



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8" />
          Configuración de Firestore
        </h1>
        <p className="text-muted-foreground mt-2">
          Verifica el estado actual de las colecciones de Firestore
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{status?.portfolio ?? '-'}</div>
              <div className="text-sm text-muted-foreground">Portfolio</div>
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



      {/* Información */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          Esta página muestra el estado actual de las colecciones de Firestore.
          Utiliza el botón "Verificar Estado" para actualizar la información.
        </AlertDescription>
      </Alert>
    </div>
  )
}
