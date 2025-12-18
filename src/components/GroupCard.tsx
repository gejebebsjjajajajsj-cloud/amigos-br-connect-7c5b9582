import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface GroupCardProps {
  name: string;
  banner: string;
  link: string;
  members?: string;
}

const GroupCard = ({ name, banner, link, members }: GroupCardProps) => {
  return (
    <div className="group-card">
      <div className="group-banner">
        <img src={banner} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        {members && (
          <p className="text-xs text-muted-foreground mb-2">{members} membros</p>
        )}
        <Button variant="telegram" size="sm" className="w-full text-xs" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Send className="w-3 h-3 mr-1" />
            Entrar
          </a>
        </Button>
      </div>
    </div>
  );
};

export default GroupCard;
