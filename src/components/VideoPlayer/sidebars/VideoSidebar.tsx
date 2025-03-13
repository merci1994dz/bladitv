
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface VideoSidebarProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right';
  children: React.ReactNode;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({
  title,
  isOpen,
  onClose,
  position,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`absolute top-16 bottom-16 ${position === 'left' ? 'left-0 rounded-r-lg' : 'right-0 rounded-l-lg'} w-72 md:w-80 bg-background/90 backdrop-blur-lg shadow-xl z-30 overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default VideoSidebar;
