import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePremium } from '@/hooks/use-premium';
import { useAdmin } from '@/hooks/use-admin';
import { useAdminPremiumToggle } from '@/hooks/use-admin-premium-toggle';

const PremiumFeatureList: React.FC = () => (
    <ul className="space-y-3 text-left text-muted-foreground">
        <li className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
            Unlimited Shuffle Mode
        </li>
        <li className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
            Ad-Free Listening Experience
        </li>
        <li className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
            High-Quality Audio Streaming (Future)
        </li>
        <li className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
            Priority Support
        </li>
    </ul>
);

const AdminToggle: React.FC = () => {
    const { togglePremium, isPending, currentStatus } = useAdminPremiumToggle();
    
    return (
        <div className="mt-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg space-y-3">
            <div className="flex items-center text-sm font-semibold text-yellow-400">
                <Shield className="h-4 w-4 mr-2" /> Admin Test Controls
            </div>
            <Button 
                onClick={() => togglePremium()}
                disabled={isPending}
                variant="outline"
                className="w-full"
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : currentStatus ? (
                    "Downgrade to Standard"
                ) : (
                    "Upgrade to Premium (Test)"
                )}
            </Button>
        </div>
    );
};

const UpgradePage: React.FC = () => {
  const isPremium = usePremium();
  const isAdmin = useAdmin();
  
  // Calculate height dynamically: 100vh - Player (80px) - Header (64px)
  const mainContentHeightClass = "min-h-[calc(100vh-80px-64px)]";

  return (
    <div className={cn("p-4 sm:p-8 flex justify-center", mainContentHeightClass)}>
      <div className="w-full max-w-3xl space-y-8">
        
        <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Subscription Management</h1>
            <p className="text-lg text-muted-foreground">Manage your Manga Music plan and unlock exclusive features.</p>
        </div>

        <Card className="p-6 sm:p-8 border-primary/50 shadow-2xl">
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-extrabold text-white">
                    {isPremium ? "Premium Plan" : "Standard Plan"}
                </CardTitle>
                <Badge 
                    className={cn(
                        "text-sm px-3 py-1",
                        isPremium ? "bg-primary hover:bg-primary/90" : "bg-secondary text-secondary-foreground"
                    )}
                >
                    {isPremium ? "Active" : "Current"}
                </Badge>
            </div>
            <CardDescription className="text-lg mt-2">
                {isPremium 
                    ? "Thank you for being a Premium member! Enjoy unlimited features."
                    : "Upgrade today to unlock the full potential of Manga Music."
                }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-6">
            <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-white">What you get with Premium:</h3>
                <PremiumFeatureList />
            </div>
            
            {!isPremium && (
                <Button size="lg" className="w-full mt-6">
                    <Zap className="h-5 w-5 mr-2" /> Upgrade Now ($4.99/month)
                </Button>
            )}
            
            {isAdmin && <AdminToggle />}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpgradePage;