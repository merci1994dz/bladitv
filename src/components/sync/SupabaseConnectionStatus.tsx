
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, ShieldAlert } from 'lucide-react';
import { checkSupabaseTablesHealth } from '@/services/sync/supabase/connection/connectionCheck';
import { checkAndFixConnectionIssues } from '@/services/sync/supabase/connection/errorFixer';
import { toast } from '@/hooks/use-toast';

interface SupabaseConnectionStatusProps {
  className?: string;
}

interface TableStatus {
  [key: string]: boolean;
}

const SupabaseConnectionStatus: React.FC<SupabaseConnectionStatusProps> = ({ 
  className = '' 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [tablesHealth, setTablesHealth] = useState<TableStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // التحقق من الاتصال عند التحميل
  useEffect(() => {
    checkConnection();
  }, []);

  // وظيفة للتحقق من الاتصال
  const checkConnection = async () => {
    setIsChecking(true);
    
    try {
      // التحقق من صحة جداول Supabase
      const health = await checkSupabaseTablesHealth();
      setTablesHealth(health);
      
      // اعتبار الاتصال ناجحًا إذا كانت جميع الجداول بصحة جيدة
      const allTablesHealthy = Object.values(health).every(status => status);
      setIsConnected(allTablesHealthy);
      
      // تحديث وقت آخر فحص
      setLastChecked(new Date());
      
      return allTablesHealthy;
    } catch (error) {
      console.error('خطأ في التحقق من اتصال Supabase:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // وظيفة لإصلاح مشاكل الاتصال
  const fixConnectionIssues = async () => {
    setIsFixing(true);
    
    try {
      toast({
        title: "جاري إصلاح مشاكل الاتصال",
        description: "محاولة إصلاح مشاكل الاتصال بقاعدة بيانات Supabase...",
        duration: 5000,
      });
      
      const isFixed = await checkAndFixConnectionIssues();
      
      if (isFixed) {
        toast({
          title: "تم إصلاح المشكلة",
          description: "تم إصلاح مشاكل الاتصال بقاعدة البيانات بنجاح",
          duration: 3000,
        });
        
        // التحقق من الاتصال مرة أخرى بعد الإصلاح
        await checkConnection();
      } else {
        toast({
          title: "تعذر إصلاح المشكلة",
          description: "لم يتم التمكن من إصلاح مشاكل الاتصال تلقائيًا",
          variant: "destructive",
          duration: 4000,
        });
      }
      
      return isFixed;
    } catch (error) {
      console.error('خطأ في إصلاح مشاكل الاتصال:', error);
      
      toast({
        title: "خطأ في الإصلاح",
        description: "حدث خطأ أثناء محاولة إصلاح مشاكل الاتصال",
        variant: "destructive",
        duration: 4000,
      });
      
      return false;
    } finally {
      setIsFixing(false);
    }
  };

  // تحديد لون الشارة بناءً على حالة الاتصال
  const getBadgeVariant = () => {
    if (isConnected === null) return "outline";
    return isConnected ? "success" : "destructive";
  };

  // تحديد نص حالة الاتصال
  const getStatusText = () => {
    if (isConnected === null) return "جاري التحقق...";
    return isConnected ? "متصل" : "غير متصل";
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">حالة اتصال Supabase:</span>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {isChecking ? "جاري التحقق..." : getStatusText()}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={checkConnection}
            disabled={isChecking || isFixing}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            فحص
          </Button>
          
          {!isConnected && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200"
              onClick={fixConnectionIssues}
              disabled={isChecking || isFixing}
            >
              <ShieldAlert className="h-3 w-3 mr-1" />
              {isFixing ? "جاري الإصلاح..." : "إصلاح"}
            </Button>
          )}
        </div>
      </div>
      
      {tablesHealth && (
        <div className="text-xs text-muted-foreground mt-1">
          {lastChecked && (
            <div className="mb-1">
              آخر فحص: {lastChecked.toLocaleTimeString()}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(tablesHealth).map(([table, status]) => (
              <Badge 
                key={table}
                variant={status ? "outline" : "destructive"} 
                className="text-xs flex justify-between p-1"
              >
                <span>{table}</span>
                <span>{status ? "✓" : "✗"}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionStatus;
