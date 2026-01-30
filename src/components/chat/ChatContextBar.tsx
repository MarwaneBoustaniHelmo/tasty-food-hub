import { useChatStore } from '@/hooks/useChatStore';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatContextBar() {
  const { currentSummary } = useChatStore();

  if (!currentSummary) return null;

  const { restaurant, delivery_platform, action_button } = currentSummary;

  // Show context bar if we have meaningful context
  const hasContext = restaurant || delivery_platform || action_button;

  if (!hasContext) return null;

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between gap-3">
        {/* Context text */}
        <div className="flex-1 min-w-0">
          {restaurant && (
            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 truncate">
              📍 {restaurant.charAt(0).toUpperCase() + restaurant.slice(1).replace('-', ' ')}
            </p>
          )}
          {delivery_platform && (
            <p className="text-xs text-amber-700 dark:text-amber-300 truncate">
              via {delivery_platform === 'uber_eats' ? 'Uber Eats' : delivery_platform === 'deliveroo' ? 'Deliveroo' : 'Takeaway'}
            </p>
          )}
        </div>

        {/* Action button */}
        {action_button && (
          <Button
            asChild
            size="sm"
            className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md"
          >
            <a
              href={action_button.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <span className="text-xs font-semibold">{action_button.text}</span>
              {action_button.type === 'order' || action_button.type === 'directions' ? (
                <ExternalLink className="w-3 h-3" />
              ) : null}
            </a>
          </Button>
        )}
      </div>

      {/* Urgency indicator */}
      {currentSummary.urgency === 'high' && (
        <div className="mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
          ⚡ Demande prioritaire - Notre équipe va vous contacter
        </div>
      )}
    </div>
  );
}
