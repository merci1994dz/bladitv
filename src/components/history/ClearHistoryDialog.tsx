
import React from 'react';
import { Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClearHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearHistory: () => void;
}

const ClearHistoryDialog: React.FC<ClearHistoryDialogProps> = ({ 
  open, 
  onOpenChange, 
  onClearHistory 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>مسح سجل المشاهدة</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من أنك تريد مسح سجل المشاهدة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={onClearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            مسح السجل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearHistoryDialog;
