import {type App, createApp} from 'vue'
import MouseMenu from '@/components/MouseMenu.vue'
import type {mouseMenuItem} from "@/types";

let currentApp: App<Element> | null = null

export async function showContextMenu(options: {
  menuItems: mouseMenuItem[]
  args?: any
  position?: { left: number; top: number }
}) {
  if (currentApp) {
    currentApp.unmount()
    currentApp = null
  }
  const position = options.position || (await window.ymkAPI.getCursorPos())
  const container = document.createElement('div')
  document.body.appendChild(container)
  currentApp = createApp(MouseMenu, {
    menuItems: options.menuItems,
    args: options.args,
    position: {
      left: position.left,
      top: position.top
    },
    onClose: () => {
      currentApp?.unmount()
      currentApp = null
      document.body.removeChild(container)
    }
  })
  currentApp.mount(container)
}