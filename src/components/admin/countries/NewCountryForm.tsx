
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCountry } from '@/services/api';
import { Country } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NewCountryForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    image: ''
  });
  
  const addCountryMutation = useMutation({
    mutationFn: addCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة البلد الجديد",
      });
      setNewCountry({
        name: '',
        flag: '',
        image: ''
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر إضافة البلد: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name || !newCountry.flag || !newCountry.image) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    addCountryMutation.mutate(newCountry);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 ml-2" />
          <span>إضافة بلد جديد</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleAddCountry}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="countryName" className="text-sm font-medium">اسم البلد</label>
              <Input
                id="countryName"
                value={newCountry.name}
                onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                placeholder="اسم البلد"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="flag" className="text-sm font-medium">رمز العلم (اموجي)</label>
              <Input
                id="flag"
                value={newCountry.flag}
                onChange={(e) => setNewCountry({...newCountry, flag: e.target.value})}
                placeholder="🇪🇬"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">صورة البلد (رابط)</label>
              <Input
                id="image"
                value={newCountry.image}
                onChange={(e) => setNewCountry({...newCountry, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">إضافة البلد</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewCountryForm;
