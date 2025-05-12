
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  // Filter out certain update notifications that are unnecessary
  const filteredToasts = toasts.filter(toast => {
    // Hide automated sync notifications
    if (toast.id && typeof toast.id === 'string' && toast.id.includes('sync-auto')) {
      return false;
    }
    
    // Check title if it's a string
    if (toast.title && typeof toast.title === 'string' && 
        (toast.title.includes('جاري المزامنة') || toast.title.includes('تم تحديث'))) {
      return false;
    }
    
    // Check description if it's a string
    if (toast.description && typeof toast.description === 'string' && 
        toast.description.includes('مصادر متاحة')) {
      return false;
    }
    
    return true;
  });

  return (
    <ToastProvider>
      {filteredToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
