import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { migrateProjectsToFirebase, cleanDuplicateProjects } from '@/services/projectService'
import { CheckCircle, XCircle, Upload, AlertTriangle } from 'lucide-react'

const MigrationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false)
  const [results, setResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const [cleanupResults, setCleanupResults] = useState<{
    removed: number
    kept: number
    errors: string[]
  } | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const handleMigration = async () => {
    setIsLoading(true)
    setHasStarted(true)
    setResults(null)

    try {
      const migrationResult = await migrateProjectsToFirebase()
      setResults(migrationResult)
    } catch (error) {
      console.error('Error durante la migración:', error)
      setResults({
        success: 0,
        errors: [`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanupDuplicates = async () => {
    setIsCleaningDuplicates(true)
    setCleanupResults(null)

    try {
      const cleanupResult = await cleanDuplicateProjects()
      setCleanupResults(cleanupResult)
    } catch (error) {
      console.error('Error durante la limpieza:', error)
      setCleanupResults({
        removed: 0,
        kept: 0,
        errors: [`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      })
    } finally {
      setIsCleaningDuplicates(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Migración de Proyectos</h1>
        <p className="text-muted-foreground">
          Migra proyectos desde localStorage hacia Firebase Firestore
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card de información */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Migración localStorage → Firebase
            </CardTitle>
            <CardDescription>
              Esta herramienta migrará todos los proyectos almacenados en localStorage 
              hacia la colección 'portfolio' en Firebase Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Esta operación verificará si los proyectos ya existen 
                  en Firebase antes de migrarlos. No se duplicarán proyectos existentes.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  onClick={handleMigration}
                  disabled={isLoading || isCleaningDuplicates}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Migrando proyectos...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Migrar Proyectos a Firebase
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleCleanupDuplicates}
                  disabled={isLoading || isCleaningDuplicates}
                  variant="destructive"
                  className="w-full"
                >
                  {isCleaningDuplicates ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4 animate-spin" />
                      Limpiando duplicados...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Limpiar Proyectos Duplicados
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados de la migración */}
        {hasStarted && results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Resultados de la Migración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {results.success} exitosos
                  </Badge>
                  {results.errors.length > 0 && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      {results.errors.length} errores
                    </Badge>
                  )}
                </div>

                {/* Mensaje de éxito */}
                {results.success > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Se migraron exitosamente <strong>{results.success}</strong> proyectos a Firebase.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Lista de errores */}
                {results.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <strong>Errores encontrados:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {results.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mensaje si no hay proyectos */}
                {results.success === 0 && results.errors.length === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron proyectos en localStorage para migrar, 
                      o todos los proyectos ya existen en Firebase.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados de limpieza de duplicados */}
        {cleanupResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cleanupResults.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Resultados de Limpieza de Duplicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {cleanupResults.kept} mantenidos
                  </Badge>
                  <Badge variant="outline" className="text-red-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    {cleanupResults.removed} eliminados
                  </Badge>
                  {cleanupResults.errors.length > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {cleanupResults.errors.length} errores
                    </Badge>
                  )}
                </div>

                {/* Mensaje de éxito */}
                {cleanupResults.removed > 0 && cleanupResults.errors.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Se eliminaron <strong>{cleanupResults.removed}</strong> proyectos duplicados y se mantuvieron <strong>{cleanupResults.kept}</strong> proyectos únicos.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mensaje cuando no hay duplicados */}
                {cleanupResults.removed === 0 && cleanupResults.errors.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron proyectos duplicados. Tu colección está limpia.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Lista de errores */}
                {cleanupResults.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <strong>Errores durante la limpieza:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {cleanupResults.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Asegúrate de que Firebase esté configurado correctamente</p>
              <p>2. Verifica que la variable VITE_USE_FIREBASE esté en 'true'</p>
              <p>3. Haz clic en "Iniciar Migración" para comenzar el proceso</p>
              <p>4. Revisa los logs en la consola del navegador para más detalles</p>
              <p>5. Una vez completada la migración, los proyectos estarán disponibles en Firebase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MigrationPage