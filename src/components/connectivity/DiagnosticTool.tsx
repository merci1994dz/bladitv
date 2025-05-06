
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, ServerIcon, ServerOffIcon } from 'lucide-react';
import { useConnectivityContext } from './ConnectivityProvider';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticToolProps {
  minimal?: boolean;
  showLabels?: boolean;
}

const DiagnosticTool: React.FC<DiagnosticToolProps> = ({ 
  minimal = false,
  showLabels = true
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const { isOnline, hasServerAccess, checkStatus, isChecking } = useConnectivityContext();
  const { toast } = useToast();

  const handleRunDiagnostic = async () => {
    if (isChecking || isRunning) return;
    
    setIsRunning(true);
    
    toast({
      title: "تشخيص الاتصال",
      description: "جاري فحص حالة الاتصال والمصادر...",
      duration: 3000,
    });
    
    try {
      await checkStatus();
      
      toast({
        title: "اكتمل التشخيص",
        description: isOnline 
          ? (hasServerAccess 
              ? "الاتصال بالإنترنت والخوادم يعمل بشكل جيد" 
              : "متصل بالإنترنت لكن تعذر الوصول للمصادر")
          : "غير متصل بالإنترنت. يرجى التحقق من اتصالك",
        duration: 5000,
      });
    } catch (error) {
      console.error("خطأ في تشخيص الاتصال:", error);
      
      toast({
        title: "خطأ في التشخيص",
        description: "حدث خطأ أثناء فحص الاتصال",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (minimal) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleRunDiagnostic} 
        disabled={isChecking || isRunning}
        className="text-xs h-7 px-2"
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${(isChecking || isRunning) ? "animate-spin" : ""}`} />
        {showLabels && "تشخيص"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">أداة تشخيص الاتصال</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRunDiagnostic}
          disabled={isChecking || isRunning}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${(isChecking || isRunning) ? "animate-spin" : ""}`} />
          تشخيص
        </Button>
      </div>
      
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs">
            {isOnline ? "متصل بالإنترنت" : "غير متصل"}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {hasServerAccess ? (
            <ServerIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ServerOffIcon className="h-4 w-4 text-amber-500" />
          )}
          <span className="text-xs">
            {hasServerAccess ? "متصل بالخوادم" : "تعذر الوصول للخوادم"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTool;
