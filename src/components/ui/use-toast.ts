"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `${count++}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(
    ({ ...props }: Omit<ToastProps, "id">) => {
      const id = generateId()

      const newToast = {
        ...props,
        id,
      }

      setToasts((prevToasts) => {
        const updatedToasts = [...prevToasts, newToast].slice(-TOAST_LIMIT)
        return updatedToasts
      })

      return {
        id,
        dismiss: () => dismissToast(id),
        update: (props: ToastProps) => updateToast({ ...props, id }),
      }
    },
    [setToasts],
  )

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((prevToasts) => {
        const updatedToasts = prevToasts.map((toast) => (toast.id === id ? { ...toast, dismissed: true } : toast))
        return updatedToasts
      })

      setTimeout(() => {
        setToasts((prevToasts) => {
          const updatedToasts = prevToasts.filter((toast) => toast.id !== id)
          return updatedToasts
        })
      }, TOAST_REMOVE_DELAY)
    },
    [setToasts],
  )

  const updateToast = useCallback(
    (props: ToastProps) => {
      setToasts((prevToasts) => {
        const updatedToasts = prevToasts.map((toast) => (toast.id === props.id ? { ...toast, ...props } : toast))
        return updatedToasts
      })
    },
    [setToasts],
  )

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (!toast.dismissed) {
        const timer = setTimeout(() => {
          dismissToast(toast.id)
        }, TOAST_REMOVE_DELAY)
        return timer
      }
      return null
    })

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [toasts, dismissToast])

  return {
    toast,
    toasts,
    dismiss: dismissToast,
  }
}
