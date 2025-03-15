
import React from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface RemoteConfigFormProps {
  remoteUrl: string;
  setRemoteUrl: (url: string) => void;
  lastSync: string | null;
  isSyncing: boolean;
  onSaveConfig: () => void;
  onSyncNow: () => void;
}

const RemoteConfigForm: React.FC<RemoteConfigFormProps> = ({
  remoteUrl,
  setRemoteUrl,
  lastSync,
  isSyncing,
  onSaveConfig,
  onSyncNow
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <span>إعداد المصدر الخارجي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="remoteUrl" className="text-sm font-medium">
            رابط ملف JSON للبيانات الخارجية
          </label>
          <Input
            id="remoteUrl"
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
            placeholder="https://example.com/api/data.json"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            يجب أن يكون الرابط لملف JSON يحتوي على حقول "channels" و "countries" و "categories"
          </p>
        </div>
        
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            آخر تحديث: {new Date(lastSync).toLocaleString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onSaveConfig}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          <span>حفظ التكوين</span>
        </Button>
        <Button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RemoteConfigForm;
