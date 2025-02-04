import { createApp, h } from 'vue';
import MessageComponent from '@/components/Message.vue';

let currentInstance: any = null;

export function showMessage(message: string, time: number = 4000) {
  // 清理现有实例
  if (currentInstance) {
    currentInstance.unmount();
  }

  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建应用实例
  const app = createApp({
    render() {
      return h(MessageComponent, {
        message,
        time,
        onDestroy: () => {
          app.unmount();
          document.body.removeChild(container);
          currentInstance = null;
        }
      });
    }
  });

  currentInstance = {
    app,
    container,
    unmount: () => {
      app.unmount();
      document.body.removeChild(container);
    }
  };

  // 挂载应用
  app.mount(container);
}