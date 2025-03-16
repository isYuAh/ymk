import { createApp, h, type App, type Component } from 'vue'
import Dialog from '@/components/Dialog.vue'

type DialogInstance = {
  close: () => void
  destroy: () => void
}

const dialogContainer = document.createElement('div')
document.body.appendChild(dialogContainer)

let dialogApps: App[] = []

export function showDialog<T>(dialogComponent: Component<{data: T}>, data?: T): DialogInstance {
  const mountNode = document.createElement('div')
  let dialogApp: App

  const closeHandler = () => {
    dialogApp.unmount()
    dialogContainer.removeChild(mountNode)
    dialogApps = dialogApps.filter(app => app !== dialogApp)
  }

  dialogApp = createApp({
    render() {
      return h(Dialog, {
        component: dialogComponent,
        data: data || {},
        onClose: () => closeHandler(),
        onDestroy: () => closeHandler()
      })
    }
  })

  // 挂载到DOM
  dialogContainer.appendChild(mountNode)
  dialogApp.mount(mountNode)

  dialogApps.push(dialogApp)

  return {
    close: closeHandler,
    destroy: closeHandler
  }
}