
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCountry, deleteCountry } from '@/services/api';
import { AdminCountry, Country } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CountryItemProps {
  country: AdminCountry;
  onToggleEdit: (id: string) => void;
  onUpdateField: (id: string, field: keyof AdminCountry, value: string) => void;
}

const CountryItem: React.FC<CountryItemProps> = ({ 
  country, 
  onToggleEdit, 
  onUpdateField 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateCountryMutation = useMutation({
    mutationFn: updateCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات البلد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر تحديث البلد: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteCountryMutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البلد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر حذف البلد: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const saveCountryChanges = () => {
    const { isEditing, ...countryData } = country;
    updateCountryMutation.mutate(countryData as Country);
    onToggleEdit(country.id);
  };

  return (
    <Card key={country.id}>
      <CardContent className="p-4">
        {country.isEditing ? (
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
                onClick={saveCountryChanges}
              >
                <Save className="h-4 w-4 ml-1" />
                <span>حفظ</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex-shrink-0 ml-4 text-5xl">
              {country.flag}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{country.name}</h3>
              <div className="text-sm truncate text-muted-foreground">
                <span dir="ltr">{country.image}</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onToggleEdit(country.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من حذف هذا البلد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف "{country.name}" نهائيًا ولا يمكن التراجع عن هذا الإجراء. لن تتمكن من حذف البلد إذا كانت هناك قنوات مرتبطة به.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteCountryMutation.mutate(country.id)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryItem;
