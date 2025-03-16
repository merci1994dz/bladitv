
import React from 'react';
import { AdminCountry } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface CountryEditFormProps {
  country: AdminCountry;
  onToggleEdit: (id: string) => void;
  onUpdateField: (id: string, field: keyof AdminCountry, value: string) => void;
  onSave: () => void;
}

const CountryEditForm: React.FC<CountryEditFormProps> = ({
  country,
  onToggleEdit,
  onUpdateField,
  onSave
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم البلد</label>
          <Input
            value={country.name}
            onChange={(e) => onUpdateField(country.id, 'name', e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رمز العلم (اموجي)</label>
          <Input
            value={country.flag}
            onChange={(e) => onUpdateField(country.id, 'flag', e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">صورة البلد (رابط)</label>
          <Input
            value={country.image}
            onChange={(e) => onUpdateField(country.id, 'image', e.target.value)}
            dir="ltr"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onToggleEdit(country.id)}
        >
          <X className="h-4 w-4 ml-1" />
          <span>إلغاء</span>
        </Button>
        <Button 
          size="sm" 
          onClick={onSave}
        >
          <Save className="h-4 w-4 ml-1" />
          <span>حفظ</span>
        </Button>
      </div>
    </div>
  );
};

export default CountryEditForm;
