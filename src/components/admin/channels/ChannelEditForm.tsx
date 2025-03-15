
import React from 'react';
import { AdminChannel } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelEditFormProps {
  channel: AdminChannel;
  categories: any[];
  countries: any[];
  onCancel: (channelId: string) => void;
  onSave: (channel: AdminChannel) => void;
  onUpdateField: (id: string, field: keyof AdminChannel, value: string) => void;
}

const ChannelEditForm: React.FC<ChannelEditFormProps> = ({
  channel,
  categories,
  countries,
  onCancel,
  onSave,
  onUpdateField
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم القناة</label>
          <Input
            value={channel.name}
            onChange={(e) => onUpdateField(channel.id, 'name', e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">شعار القناة (رابط)</label>
          <Input
            value={channel.logo}
            onChange={(e) => onUpdateField(channel.id, 'logo', e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رابط البث</label>
          <Input
            value={channel.streamUrl}
            onChange={(e) => onUpdateField(channel.id, 'streamUrl', e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الفئة</label>
          <Select
            value={channel.category}
            onValueChange={(value) => onUpdateField(channel.id, 'category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">البلد</label>
          <Select
            value={channel.country}
            onValueChange={(value) => onUpdateField(channel.id, 'country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر البلد" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {countries?.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onCancel(channel.id)}
        >
          <X className="h-4 w-4 ml-1" />
          <span>إلغاء</span>
        </Button>
        <Button 
          size="sm" 
          onClick={() => onSave(channel)}
        >
          <Save className="h-4 w-4 ml-1" />
          <span>حفظ</span>
        </Button>
      </div>
    </div>
  );
};

export default ChannelEditForm;
