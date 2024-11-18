'use client'

import React, { createContext, useContext } from 'react'
import {  ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

// Definimos los tipos de notificaciones
type NotificationType = 'add' | 'delete' | 'edit'

// Creamos un contexto para manejar las notificaciones
const NotificationContext = createContext<{
  showNotification: (type: NotificationType, username: string) => void
} | undefined>(undefined)

// Hook personalizado para usar las notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

// Proveedor de notificaciones
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()

  const showNotification = (type: NotificationType, username: string) => {
    let title = ''
    let description = ''

    switch (type) {
      case 'add':
        title = 'Usuario Agregado'
        description = `Se ha agregado el usuario ${username} exitosamente.`
        break
      case 'delete':
        title = 'Usuario Eliminado'
        description = `Se ha eliminado el usuario ${username} exitosamente.`
        break
      case 'edit':
        title = 'Usuario Editado'
        description = `Se han guardado los cambios para el usuario ${username}.`
        break
    }

    toast({
      title,
      description,
    })
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </NotificationContext.Provider>
  )
}

// Componente de ejemplo que usa las notificaciones
export const UserActionButton: React.FC<{
  action: NotificationType
  username: string
}> = ({ action, username }) => {
  const { showNotification } = useNotification()

  const handleClick = () => {
    showNotification(action, username)
  }

  const actionText = action === 'add' ? 'Agregar' : action === 'delete' ? 'Eliminar' : 'Editar'

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      {actionText} Usuario
    </button>
  )
}
