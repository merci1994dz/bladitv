
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

const JsonFormatHelp: React.FC = () => {
  return (
    <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <span>هام</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-amber-800 dark:text-amber-300">
        <p className="mb-2">يجب أن يكون ملف JSON بالتنسيق التالي:</p>
        <pre className="bg-white dark:bg-black/20 p-3 rounded-md text-xs overflow-x-auto">
{`{
  "channels": [
    { 
      "id": "1", 
      "name": "اسم القناة", 
      "logo": "رابط الشعار",
      "streamUrl": "رابط البث",
      "category": "معرف الفئة",
      "country": "معرف البلد",
      "isFavorite": false
    }
  ],
  "countries": [
    {
      "id": "1",
      "name": "اسم البلد",
      "flag": "🇪🇬",
      "image": "رابط الصورة"
    }
  ],
  "categories": [
    {
      "id": "1",
      "name": "اسم الفئة",
      "icon": "رمز الفئة"
    }
  ]
}`}
        </pre>
      </CardContent>
    </Card>
  );
};

export default JsonFormatHelp;
