
import React from 'react';
import { AdminChannel } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
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

interface ChannelDisplayCardProps {
  channel: AdminChannel;
  countries: any[];
  categories: any[];
  onEdit: (channelId: string) => void;
  onDelete: (channelId: string) => void;
}

const ChannelDisplayCard: React.FC<ChannelDisplayCardProps> = ({
  channel,
  countries,
  categories,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 ml-4">
        <img 
          src={channel.logo} 
          alt={channel.name} 
          className="w-16 h-16 object-contain bg-gray-100 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
          }}
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg">{channel.name}</h3>
        <div className="text-sm text-muted-foreground">
          {countries?.find(c => c.id === channel.country)?.name} {countries?.find(c => c.id === channel.country)?.flag} | 
          {categories?.find(c => c.id === channel.category)?.name}
        </div>
      </div>
      <div className="flex-shrink-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(channel.id)}
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
              <AlertDialogTitle>هل أنت متأكد من حذف هذه القناة؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف "{channel.name}" نهائيًا ولا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(channel.id)}
                className="bg-destructive text-destructive-foreground"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ChannelDisplayCard;
