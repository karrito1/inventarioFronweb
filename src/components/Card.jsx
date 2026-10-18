
import React from 'react';
import { cn } from '@/lib/utils';

const Card = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  className,
  children 
}) => {
  return (
    <div className={cn(
      'bg-card rounded-xl p-6 shadow-sm border border-border transition-all duration-200 hover:shadow-md',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
          )}
          {value && (
            <p className="text-3xl font-bold mb-1">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {Icon && (
          <div className="ml-4 p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          'mt-4 text-sm font-medium',
          trend.positive ? 'text-green-600' : 'text-destructive'
        )}>
          {trend.value}
        </div>
      )}
    </div>
  );
};

export default Card;
