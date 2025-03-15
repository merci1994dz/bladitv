
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon: Icon, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="h-5 w-5 ml-2" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
