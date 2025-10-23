import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Image as ImageIcon, Upload, Loader2, RefreshCcw } from 'lucide-react'
import { getHomeHeroImage, setHomeHeroImage, getHomeTextSettings, setHomeTextSettings } from '@/services/siteSettingsService'

import ImageSelector from '@/components/ui/ImageSelector'
import { Switch } from '@/components/ui/switch'

// Utilidad local para extraer path de Firebase Storage desde URL pública
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/o\/(.+?)\?/)
    if (match && match[1]) return decodeURIComponent(match[1])
    const altMatch = url.match(/\/([^\/]+\.(jpg|jpeg|png|gif|webp|svg))(\?|$)/i)
    if (altMatch && altMatch[1]) return altMatch[1]
    return null
  } catch {
    return null
  }
}

export default function HomeSettingsPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Estado para URL manual del selector
  const [inputUrl, setInputUrl] = useState<string>('')
  // Estado de textos del Home
  const [dynamicEnabled, setDynamicEnabled] = useState<boolean>(true)
  const [titles, setTitles] = useState<string[]>(['Desarrollador web', 'Ingeniero informático'])
  const [staticTitle, setStaticTitle] = useState<string>('Ingeniero informático y desarrollador web')
  const [tagline, setTagline] = useState<string>('Creando experiencias digitales memorables que fusionan diseño y tecnología para resolver problemas complejos.')
  const [savingTexts, setSavingTexts] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const url = await getHomeHeroImage()
        setCurrentUrl(url)
      } catch (e) {
        console.warn('No se pudo cargar imagen del Home:', e)
      }
      try {
        const textSettings = await getHomeTextSettings()
        if (textSettings) {
          setDynamicEnabled(textSettings.dynamicEnabled)
          setTitles(textSettings.titles)
          setStaticTitle(textSettings.staticTitle)
          setTagline(textSettings.tagline)
        }
      } catch (e) {
        console.warn('No se pudieron cargar los textos del Home:', e)
      }
    }
    load()
  }, [])



  const onRestoreDefault = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      await setHomeHeroImage(null, null)
      setCurrentUrl(null)
      setMessage('Se restauró la imagen por defecto del Home')
    } catch (e) {
      console.error(e)
      setError('No se pudo restaurar la imagen por defecto')
    } finally {
      setLoading(false)
    }
  }

  // Aplicar URL manual desde ImageSelector
  const onApplyInputUrl = async () => {
    if (!inputUrl) return
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const path = extractStoragePathFromUrl(inputUrl)
      await setHomeHeroImage(inputUrl, path)
      setCurrentUrl(inputUrl)
      setMessage('URL aplicada correctamente al Home')
    } catch (e) {
      console.error(e)
      setError('No se pudo aplicar la URL')
    } finally {
      setLoading(false)
    }
  }

  // Capturar imágenes subidas desde ImageSelector
  const onImagesUploaded = async (urls: string[]) => {
    if (!urls || urls.length === 0) return
    const url = urls[0]
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const path = extractStoragePathFromUrl(url)
      await setHomeHeroImage(url, path)
      setCurrentUrl(url)
      setMessage('Imagen subida y aplicada correctamente')
    } catch (e) {
      console.error(e)
      setError('Error al procesar la imagen subida')
    } finally {
      setLoading(false)
    }
  }

  // Guardar textos del Home
  const onSaveTexts = async () => {
    setSavingTexts(true)
    setMessage(null)
    setError(null)
    try {
      await setHomeTextSettings({
        dynamicEnabled,
        titles,
        staticTitle,
        tagline,
      })
      setMessage('Textos del Home guardados correctamente')
    } catch (e) {
      console.error(e)
      setError('Error al guardar los textos del Home')
    } finally {
      setSavingTexts(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Configuración de Home: Foto principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label>Imagen actual</Label>
              <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[200px]">
                {currentUrl ? (
                  <img src={currentUrl} alt="Imagen Home" className="max-h-64 rounded-md object-cover" />
                ) : (
                  <div className="text-sm text-muted-foreground">Usando imagen por defecto de /public</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar nueva imagen</Label>
                <ImageSelector
                  value={inputUrl}
                  onChange={(url) => setInputUrl(url)}
                  onImagesUploaded={onImagesUploaded}
                  label=""
                  preset="featured"
                  maxFiles={1}
                  multiple={false}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Puedes subir una imagen optimizada o ingresar una URL. Se almacenará en Firebase Storage y se guardará la URL en settings.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={onApplyInputUrl} disabled={!inputUrl || loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Aplicar URL
                </Button>
                <Button variant="outline" onClick={onRestoreDefault} disabled={loading}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Restaurar por defecto
                </Button>
              </div>

              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Textos del Home */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de textos del Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <Switch checked={dynamicEnabled} onCheckedChange={setDynamicEnabled} />
            <span className="text-sm">Usar títulos dinámicos</span>
          </div>

          {dynamicEnabled ? (
            <div className="space-y-3">
              <Label>Títulos a rotar</Label>
              {titles.map((t, idx) => (
                <div key={`title-${idx}`} className="flex gap-2">
                  <Input
                    value={t}
                    onChange={(e) => {
                      const newTitles = [...titles]
                      newTitles[idx] = e.target.value
                      setTitles(newTitles)
                    }}
                    placeholder={idx === 0 ? 'Ej. Desarrollador web' : 'Ej. Ingeniero informático'}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setTitles(titles.filter((_, i) => i !== idx))}
                    disabled={titles.length <= 1}
                  >
                    Borrar
                  </Button>
                </div>
              ))}
              <div>
                <Button variant="secondary" onClick={() => setTitles([...titles, ''])}>Agregar título</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Título estático</Label>
              <Input
                value={staticTitle}
                onChange={(e) => setStaticTitle(e.target.value)}
                placeholder="Ej. Ingeniero informático y desarrollador web"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Frase/Tagline</Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. Creando experiencias digitales memorables..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={onSaveTexts} disabled={savingTexts}>
              {savingTexts ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : null}
              Guardar textos
            </Button>
          </div>

          {message && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}