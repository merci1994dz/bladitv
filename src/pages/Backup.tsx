
import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Save, AlertTriangle, Clock } from 'lucide-react';
import { exportBackup, importBackup, createBackup } from '@/services/backupService';
import AdminLogin from '@/components/AdminLogin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BackupPage: React.FC = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportBackup = () => {
    exportBackup();
  };
  
  const handleImportBackupClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // فحص امتداد الملف
    if (file.name.split('.').pop()?.toLowerCase() !== 'json') {
      toast({
        title: "نوع ملف غير صالح",
        description: "يجب أن يكون الملف بتنسيق JSON",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await importBackup(file);
      // إعادة تعيين حقل إدخال الملف ليمكن اختيار نفس الملف مرة أخرى
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('فشل استيراد النسخة الاحتياطية:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  
  // استخراج بعض المعلومات عن النسخة الاحتياطية الحالية
  const currentBackup = createBackup();
  const channelsCount = currentBackup.channels.length;
  const countriesCount = currentBackup.countries.length;
  const categoriesCount = currentBackup.categories.length;
  const lastSyncTime = new Date(currentBackup.lastSyncTime);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">إدارة النسخ الاحتياطية</h1>
        <p className="text-muted-foreground">
          تصدير واستيراد بيانات التطبيق للحفاظ عليها أو استعادتها عند الحاجة
        </p>
      </header>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            <span>بيانات النسخة الاحتياطية الحالية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">عدد القنوات</div>
              <div className="text-2xl font-bold">{channelsCount}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">عدد البلدان</div>
              <div className="text-2xl font-bold">{countriesCount}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">عدد الفئات</div>
              <div className="text-2xl font-bold">{categoriesCount}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">آخر تحديث</div>
              <div className="text-2xl font-bold">{lastSyncTime.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
            <Clock className="h-4 w-4" />
            <span>سيتم تضمين كافة البيانات المخزنة محليًا في النسخة الاحتياطية</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExportBackup}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span>تصدير نسخة احتياطية</span>
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>استعادة نسخة احتياطية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>تحذير</AlertTitle>
            <AlertDescription>
              ستؤدي استعادة النسخة الاحتياطية إلى استبدال جميع البيانات الحالية. لا يمكن التراجع عن هذه العملية.
            </AlertDescription>
          </Alert>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleImportBackupClick}
            disabled={isLoading}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Upload className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'جاري الاستعادة...' : 'استعادة من ملف'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BackupPage;
