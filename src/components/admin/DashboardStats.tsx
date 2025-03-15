
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Tv, Globe, Users, Clock } from 'lucide-react';

interface DashboardStatsProps {
  channelsCount: number;
  countriesCount: number;
  categoriesCount: number;
  lastSyncTime: string | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  channelsCount,
  countriesCount,
  categoriesCount,
  lastSyncTime
}) => {
  const formatLastSync = () => {
    if (!lastSyncTime) return 'لم تتم المزامنة بعد';
    
    try {
      const date = new Date(lastSyncTime);
      return date.toLocaleString('ar-SA');
    } catch (e) {
      return lastSyncTime;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Tv className="h-5 w-5" />
            <span>إجمالي القنوات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{channelsCount}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
            <Globe className="h-5 w-5" />
            <span>إجمالي الدول</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-800 dark:text-green-200">{countriesCount}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <BarChart4 className="h-5 w-5" />
            <span>إجمالي الفئات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-800 dark:text-amber-200">{categoriesCount}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Clock className="h-5 w-5" />
            <span>آخر تحديث</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md font-medium text-purple-800 dark:text-purple-200 line-clamp-2">{formatLastSync()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
