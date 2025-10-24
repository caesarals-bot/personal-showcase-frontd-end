import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, Phone, MessageCircle } from 'lucide-react';
import { getProfile } from '@/services/aboutService';
import type { Profile } from '@/types/about.types';

interface InactiveUserNotificationProps {
  message?: string;
  onClose?: () => void;
}

export const InactiveUserNotification: React.FC<InactiveUserNotificationProps> = ({ 
  message = "Tu cuenta ha sido desactivada. Por favor, contacta al administrador para más información.",
  onClose 
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error al cargar perfil del administrador:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Datos de fallback si no se puede cargar el perfil
  const adminEmail = profile?.contact?.email || 'admin@tudominio.com';
  const adminPhone = profile?.contact?.phone || '+1 (555) 123-4567';
  const adminName = profile?.fullName || 'Administrador';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Icono de advertencia */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full">
          <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">
          Cuenta Desactivada
        </h2>

        {/* Mensaje principal */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Información de contacto */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Contacta a {loading ? 'Administrador' : adminName}:
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              <span>{adminEmail}</span>
            </div>
            
            {adminPhone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 mr-2 text-green-500" />
                <span>{adminPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invitación a la sección de contacto */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <MessageCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                ¿Prefieres usar el formulario de contacto?
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                También puedes visitarme en la sección "Contáctame" para enviar tu solicitud de reactivación.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`mailto:${adminEmail}?subject=Solicitud de Reactivación de Cuenta`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors duration-200"
          >
            Enviar Email
          </a>
          
          <a
            href="/contactame"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors duration-200"
          >
            Ir a Contacto
          </a>
          
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Nota adicional */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Tu cuenta y todos tus datos están seguros. Una vez reactivada, podrás acceder normalmente.
        </p>
      </div>
    </div>
  );
};

export default InactiveUserNotification;