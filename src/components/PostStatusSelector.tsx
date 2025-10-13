/**
 * Selector de estado de post con permisos basados en roles
 */

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import type { PostStatus } from '@/types/blog.types'
import type { UserRole } from '@/utils/permissions'
import {
  getAllowedStatusTransitions,
  getStatusHelpText,
} from '@/utils/permissions'
import {
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
} from '@/utils/postStatus'

interface PostStatusSelectorProps {
  currentStatus: PostStatus
  userRole: UserRole
  isAuthor: boolean
  onChange: (status: PostStatus) => void
  disabled?: boolean
}

export function PostStatusSelector({
  currentStatus,
  userRole,
  isAuthor,
  onChange,
  disabled = false,
}: PostStatusSelectorProps) {
  const allowedStatuses = getAllowedStatusTransitions(userRole, currentStatus, isAuthor)
  const helpText = getStatusHelpText(userRole, currentStatus)

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado del Post</label>
        <Select
          value={currentStatus}
          onValueChange={(value) => onChange(value as PostStatus)}
          disabled={disabled || allowedStatuses.length <= 1}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(currentStatus)}</span>
                <span>{getStatusLabel(currentStatus)}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(status)}</span>
                  <span>{getStatusLabel(status)}</span>
                  {status === currentStatus && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Actual
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Badge visual del estado actual */}
      <div className="flex items-center gap-2">
        <Badge
          style={{
            backgroundColor: getStatusColor(currentStatus),
            color: 'white',
          }}
        >
          {getStatusIcon(currentStatus)} {getStatusLabel(currentStatus)}
        </Badge>
        {userRole === 'user' && currentStatus === 'review' && (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            ⏳ Esperando aprobación
          </Badge>
        )}
      </div>

      {/* Mensaje de ayuda */}
      {helpText && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">{helpText}</AlertDescription>
        </Alert>
      )}

      {/* Advertencia para usuarios */}
      {userRole === 'user' && currentStatus === 'draft' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            💡 <strong>Tip:</strong> Cuando tu post esté listo, cámbialo a{' '}
            <strong>"En Revisión"</strong> para que el administrador lo apruebe y publique.
          </AlertDescription>
        </Alert>
      )}

      {/* Info para admin */}
      {userRole === 'admin' && currentStatus === 'review' && (
        <Alert className="border-amber-500 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            👁️ <strong>Acción requerida:</strong> Este post está esperando tu aprobación para ser
            publicado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
