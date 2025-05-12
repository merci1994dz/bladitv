
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
    if (toast.id?.includes('sync-auto') || 
        toast.title?.includes('جاري المزامنة') ||
        toast.title?.includes('تم تحديث') ||
        toast.description?.includes('مصادر متاحة')) {
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
