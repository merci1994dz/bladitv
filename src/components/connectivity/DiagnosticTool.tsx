
import React, { useState } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  ServerOff, 
  Globe,
  Database,
  AlertTriangle,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { testEndpointAvailability } from '@/services/sync/status/connectivity/connectivity-checker';
import { useConnectivityContext } from './ConnectivityProvider';

interface TestResult {
  name: string;
  status: 'success' | 'failure' | 'pending';
  message: string;
  timestamp: number;
}

const DiagnosticTool = () => {
  const { 
    isOnline, 
    hasServerAccess, 
    checkStatus 
  } = useConnectivityContext();
  
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  // Define the endpoints to test
  const testEndpoints = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
    { name: 'Vercel', url: 'https://vercel.com' },
    // Add more endpoints as needed
  ];

  // Run all diagnostic tests
  const runDiagnostics = async () => {
    setIsRunningTests(true);
    setProgress(0);
    setResults([]);
    
    // First check if we're online
    const internetTest: TestResult = {
      name: 'اتصال الإنترنت',
      status: navigator.onLine ? 'success' : 'failure',
      message: navigator.onLine 
        ? 'متصل بالإنترنت' 
        : 'غير متصل بالإنترنت - تحقق من شبكة WiFi أو بيانات الجوال',
      timestamp: Date.now()
    };
    
    setResults([internetTest]);
    setProgress(20);
    
    // If not online, no need to run other tests
    if (!navigator.onLine) {
      setIsRunningTests(false);
      setProgress(100);
      return;
    }
    
    // Test endpoints
    let endpointResults: TestResult[] = [];
    let successCount = 0;
    
    for (let i = 0; i < testEndpoints.length; i++) {
      const endpoint = testEndpoints[i];
      try {
        const isAvailable = await testEndpointAvailability(endpoint.url);
        
        if (isAvailable) successCount++;
        
        endpointResults.push({
          name: `اختبار الوصول إلى ${endpoint.name}`,
          status: isAvailable ? 'success' : 'failure',
          message: isAvailable 
            ? `يمكن الوصول إلى ${endpoint.name}` 
            : `تعذر الوصول إلى ${endpoint.name}`,
          timestamp: Date.now()
        });
        
        setResults([internetTest, ...endpointResults]);
        setProgress(20 + Math.floor(60 * (i + 1) / testEndpoints.length));
      } catch (error) {
        console.error(`خطأ في اختبار ${endpoint.name}:`, error);
        
        endpointResults.push({
          name: `اختبار الوصول إلى ${endpoint.name}`,
          status: 'failure',
          message: `حدث خطأ أثناء اختبار ${endpoint.name}`,
          timestamp: Date.now()
        });
        
        setResults([internetTest, ...endpointResults]);
        setProgress(20 + Math.floor(60 * (i + 1) / testEndpoints.length));
      }
    }
    
    // Add server connectivity test
    await checkStatus();
    
    const serverTest: TestResult = {
      name: 'الوصول إلى خادم البيانات',
      status: hasServerAccess ? 'success' : 'failure',
      message: hasServerAccess 
        ? 'يمكن الوصول إلى خادم البيانات' 
        : 'تعذر الوصول إلى خادم البيانات - قد تكون هناك مشكلة في الخادم',
      timestamp: Date.now()
    };
    
    setResults([internetTest, ...endpointResults, serverTest]);
    setProgress(100);
    setIsRunningTests(false);
  };

  // Get the overall status
  const getOverallStatus = () => {
    if (results.length === 0) return 'لم يتم إجراء التشخيص بعد';
    if (results.some(r => r.status === 'failure')) return 'توجد مشاكل في الاتصال';
    return 'الاتصال يعمل بشكل جيد';
  };
  
  // Get icon for a test result
  const getResultIcon = (status: 'success' | 'failure' | 'pending') => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <X className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>أداة تشخيص الاتصال</CardTitle>
            <CardDescription>تحقق من حالة اتصالك بالإنترنت والمصادر</CardDescription>
          </div>
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">حالة الاتصال</div>
              <div className="text-sm text-muted-foreground">
                {isOnline ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasServerAccess ? (
              <Server className="h-5 w-5 text-green-500" />
            ) : (
              <ServerOff className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <div className="font-medium">المصادر</div>
              <div className="text-sm text-muted-foreground">
                {hasServerAccess ? 'متاحة' : 'غير متاحة'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">البيانات المحلية</div>
              <div className="text-sm text-muted-foreground">متاحة</div>
            </div>
          </div>
        </div>
        
        {isRunningTests && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>جاري إجراء الاختبارات...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {results.length > 0 && (
          <div className="space-y-2 border rounded-md p-3">
            <div className="flex items-center gap-2 font-medium pb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>نتائج التشخيص: {getOverallStatus()}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2 py-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.status)}
                    <span className="text-sm">{result.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={runDiagnostics}
          disabled={isRunningTests}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'جاري الاختبار...' : 'تشخيص الاتصال'}
        </Button>
        
        <Button variant="link" size="sm" className="px-0" asChild>
          <a 
            href="https://support.google.com/chrome/answer/6179191?hl=ar" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>مساعدة في حل مشاكل الاتصال</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiagnosticTool;
