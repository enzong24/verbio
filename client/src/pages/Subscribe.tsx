// Stripe subscription page (from blueprint:javascript_stripe)
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Crown } from "lucide-react";
import { PremiumWelcomeModal } from "@/components/PremiumWelcomeModal";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscribe?payment=success`,
      },
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded without redirect - trigger success state
      window.history.pushState({}, '', '/subscribe?payment=success');
      window.location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-subscribe">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-subscribe-submit"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Subscribe to Premium'
        )}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { toast } = useToast();
  const { playPremiumCelebration } = useSound();

  useEffect(() => {
    // Check if returning from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setPaymentSuccess(true);
      setIsLoading(false);
      setShowPremiumModal(true);
      playPremiumCelebration();
      toast({
        title: "Payment Successful!",
        description: "Welcome to Verbio Premium! Your account has been upgraded.",
      });
      return;
    }

    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/create-subscription")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create subscription');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Subscription error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{paymentSuccess ? 'Processing your upgrade...' : 'Loading payment form...'}</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full" data-testid="card-payment-success">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>Payment Successful!</CardTitle>
            <CardDescription>
              Welcome to Verbio Premium. Your account has been upgraded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Unlimited Medium and Hard matches</p>
              <p>✓ Custom topic selection in Practice Mode</p>
              <p>✓ Detailed AI feedback on every message</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Redirecting to home in a moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unable to Load Payment</CardTitle>
            <CardDescription>
              We couldn't initialize the payment form. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-background py-12 px-4" data-testid="page-subscribe">
      <PremiumWelcomeModal 
        isOpen={showPremiumModal} 
        onClose={() => {
          setShowPremiumModal(false);
          window.location.href = '/';
        }} 
      />
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Premium Features */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Upgrade to Verbio Premium</CardTitle>
            <CardDescription className="text-lg">
              Unlock unlimited learning potential
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">$9.99</div>
              <div className="text-muted-foreground">per month</div>
            </div>

            <div className="space-y-3">
              {[
                'Unlimited Medium & Hard difficulty matches',
                'Advanced AI feedback with detailed corrections',
                'Topic selection in practice mode',
                'Priority matchmaking',
                'Detailed performance analytics',
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Secure payment processed by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By subscribing, you agree to our Terms of Service. Cancel anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}
