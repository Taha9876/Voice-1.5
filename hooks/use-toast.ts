"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<
  string,
  {
    toast: ToastProps
    timeout: ReturnType<typeof setTimeout>
  }
>

type ActionType =
  | {
      type: "ADD_TOAST"
      toast: ToastProps
    }
  | {
      type: "UPDATE_TOAST"
      toast: ToastProps
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: string
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: string
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToast = (toastId: string, timeout: () => void) => {
  toastTimeouts.set(toastId, setTimeout(timeout, TOAST_REMOVE_DELAY))
}

const clearFromTimeout = (toastId: string) => {
  const timeout = toastTimeouts.get(toastId)
  if (timeout) {
    clearTimeout(timeout)
  }
}

export const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST":
      const { toastId } = action
      // ! Side effects ! - This means we'll lose newly added toasts if we set it to limit 1
      if (toastId) {
        clearFromTimeout(toastId)
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
      }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Pick<ToastProps, "id" | "title" | "description" | "action" | "onOpenChange">
type Dismiss = (toastId?: string) => void
type ShowToast = (props: Toast) => {
  id: string
  dismiss: () => void
  update: (props: Toast) => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const dismiss: Dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  const showToast: ShowToast = React.useCallback(
    ({ ...props }) => {
      const id = props.id || generateId()

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) {
              dismiss(id)
            }
          },
        },
      })

      addToast(id, () => dispatch({ type: "REMOVE_TOAST", toastId: id }))

      return {
        id: id,
        dismiss: () => dismiss(id),
        update: (props: Toast) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
      }
    },
    [dismiss],
  )

  return {
    ...state,
    toast: showToast,
    dismiss,
  }
}
