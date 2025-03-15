
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, RefreshCw } from 'lucide-react';

interface SyncSettingsProps {
  lastSyncTime: string | null;
  isSyncing: boolean;
  autoPublish: boolean;
  setAutoPublish: (value: boolean) => void;
  handleForceSync: () => Promise<void>;
}

const SyncSettings: React.FC<SyncSettingsProps> = ({
  lastSyncTime,
  isSyncing,
  autoPublish,
  setAutoPublish,
  handleForceSync
}) => {
  return (
    <Card className="border border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings className="h-5 w-5 text-primary" />
          <span>إعدادات المزامنة</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-publish"
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                />
                <Label htmlFor="auto-publish" className="font-medium">النشر التلقائي للقنوات</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                عند التفعيل، سيتم نشر القنوات تلقائياً للمستخدمين بعد الإضافة أو التعديل
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>مزامنة البيانات</span>
            </Button>
          </div>
          
          {lastSyncTime && (
            <p className="text-sm text-muted-foreground">
              آخر تحديث: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncSettings;
