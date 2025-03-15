
import React, { useState, useEffect } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { 
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry,
} from '@/services/api';
import { Country, AdminCountry } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  Save, 
  X
} from 'lucide-react';
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

const CountriesTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For new items
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    image: ''
  });
  
  // For editing
  const [editableCountries, setEditableCountries] = useState<AdminCountry[]>([]);
  
  // Queries
  const { 
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries
  });

  // Use useEffect to handle data changes
  useEffect(() => {
    if (countries) {
      setEditableCountries(countries.map(country => ({ ...country, isEditing: false })));
    }
  }, [countries]);
  
  // Mutations
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
  
  const toggleEditCountry = (id: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, isEditing: !country.isEditing } 
        : country
    ));
  };
  
  const updateEditableCountry = (id: string, field: keyof AdminCountry, value: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, [field]: value } 
        : country
    ));
  };
  
  const saveCountryChanges = (country: AdminCountry) => {
    const { isEditing, ...countryData } = country;
    updateCountryMutation.mutate(countryData as Country);
    toggleEditCountry(country.id);
  };

  if (isLoadingCountries) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
      
      <h2 className="text-xl font-bold mt-8 mb-4">قائمة البلدان ({editableCountries.length})</h2>
      
      <div className="space-y-4">
        {editableCountries.map(country => (
          <Card key={country.id}>
            <CardContent className="p-4">
              {country.isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم البلد</label>
                      <Input
                        value={country.name}
                        onChange={(e) => updateEditableCountry(country.id, 'name', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رمز العلم (اموجي)</label>
                      <Input
                        value={country.flag}
                        onChange={(e) => updateEditableCountry(country.id, 'flag', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">صورة البلد (رابط)</label>
                      <Input
                        value={country.image}
                        onChange={(e) => updateEditableCountry(country.id, 'image', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleEditCountry(country.id)}
                    >
                      <X className="h-4 w-4 ml-1" />
                      <span>إلغاء</span>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => saveCountryChanges(country)}
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
                      onClick={() => toggleEditCountry(country.id)}
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
        ))}
      </div>
    </div>
  );
};

export default CountriesTab;
