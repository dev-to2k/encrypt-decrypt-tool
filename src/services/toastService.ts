interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

class ToastService {
  private container: HTMLElement | null = null;
  private currentToast: HTMLElement | null = null;

  private getContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(options: ToastOptions) {
    const { message, type = 'success', duration = 3000 } = options;
    
    // Remove existing toast immediately
    if (this.currentToast) {
      this.currentToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease-out;
      pointer-events: auto;
      max-width: 400px;
      word-break: break-word;
    `;

    const icon = document.createElement('span');
    icon.textContent = this.getIcon(type);
    icon.style.cssText = 'font-size: 16px;';

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    this.getContainer().appendChild(toast);
    this.currentToast = toast;

    // Trigger fade in animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto remove
    const timer = setTimeout(() => {
      this.hide(toast);
    }, duration);

    // Allow manual dismiss on click
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      this.hide(toast);
    });
  }

  private hide(toast: HTMLElement) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      if (this.currentToast === toast) {
        this.currentToast = null;
      }
    }, 300);
  }

  private getBackgroundColor(type: string): string {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#10b981';
    }
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '✅';
    }
  }
}

export const toastService = new ToastService();
