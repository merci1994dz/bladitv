
import React from 'react';
import { Channel } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Tag, Flag, ImageIcon, LinkIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelFormFieldsProps {
  channel: Omit<Channel, 'id'>;
  onChange: (field: keyof Omit<Channel, 'id'>, value: string) => void;
  categories: any[];
  countries: any[];
}

const ChannelFormFields: React.FC<ChannelFormFieldsProps> = ({
  channel,
  onChange,
  categories,
  countries
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-primary/80" />
          <span>اسم القناة</span>
        </Label>
        <Input
          id="name"
          value={channel.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="اسم القناة"
          dir="rtl"
          className="transition-all focus:border-primary"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="logo" className="flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-primary/80" />
          <span>شعار القناة (رابط)</span>
        </Label>
        <Input
          id="logo"
          value={channel.logo}
          onChange={(e) => onChange('logo', e.target.value)}
          placeholder="https://example.com/logo.png"
          dir="ltr"
          className="transition-all focus:border-primary"
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="streamUrl" className="flex items-center gap-1.5">
          <LinkIcon className="h-4 w-4 text-primary/80" />
          <span>رابط البث</span>
        </Label>
        <Input
          id="streamUrl"
          value={channel.streamUrl}
          onChange={(e) => onChange('streamUrl', e.target.value)}
          placeholder="https://example.com/stream.m3u8"
          dir="ltr"
          className="transition-all focus:border-primary"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-primary/80" />
          <span>الفئة</span>
        </Label>
        <Select
          value={channel.category}
          onValueChange={(value) => onChange('category', value)}
        >
          <SelectTrigger id="category" className="transition-all">
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
        <Label htmlFor="country" className="flex items-center gap-1.5">
          <Flag className="h-4 w-4 text-primary/80" />
          <span>البلد</span>
        </Label>
        <Select
          value={channel.country}
          onValueChange={(value) => onChange('country', value)}
        >
          <SelectTrigger id="country" className="transition-all">
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
  );
};

export default ChannelFormFields;
