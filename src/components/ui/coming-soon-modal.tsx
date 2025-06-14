
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export const ComingSoonModal = ({ isOpen, onClose, feature }: ComingSoonModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Clock className="w-16 h-16 text-purple-500" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {feature} Coming Soon!
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>We're working hard to bring you this amazing feature.</p>
            <div className="flex items-center justify-center space-x-1 text-sm text-purple-600">
              <Heart className="w-4 h-4" />
              <span>Stay tuned for updates!</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
