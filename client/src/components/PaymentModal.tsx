// Payment Modal Component - India-compatible payment processing
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building2, Bitcoin, Zap, TrendingUp, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  region?: string;
}

export function PaymentModal({ isOpen, onClose, userId = 'anonymous', region = 'IN' }: PaymentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');

  // Fetch credit packages with dynamic pricing
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['/api/gateway/credits/packages', region],
  });

  const packages = (packagesData as any)?.packages || [];
  const paymentMethods = (packagesData as any)?.paymentMethods || [];
  const metrics = (packagesData as any)?.optimizationMetrics || {};

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedMethod) return;

    // This would integrate with actual payment processing
    console.log('Processing payment:', {
      package: selectedPackage,
      method: selectedMethod,
      region
    });

    // Show success message and close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white">
                  Purchase Intelligence Credits
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Dynamic pricing indicator */}
              <div className="flex items-center gap-4 mt-4">
                <Badge variant={metrics.isPeakHour ? 'destructive' : 'secondary'}>
                  {metrics.isPeakHour ? 'Peak Hours' : 'Off-Peak Discount'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <TrendingUp className="w-4 h-4" />
                  <span>Server Load: {Math.round((metrics.serverLoad || 0.5) * 100)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Zap className="w-4 h-4" />
                  <span>Demand: {metrics.demandLevel || 'Normal'}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Credit Packages */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Select Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg: any) => (
                    <motion.div
                      key={pkg.credits}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedPackage?.credits === pkg.credits
                            ? 'ring-2 ring-purple-500 bg-purple-900/20'
                            : 'bg-white/5 hover:bg-white/10'
                        } border-white/10`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-white">
                              {pkg.credits}
                            </span>
                            {pkg.popular && (
                              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                                Popular
                              </Badge>
                            )}
                            {pkg.bestValue && (
                              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                                Best Value
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            {pkg.bonus > 0 && (
                              <div className="text-green-400">
                                +{pkg.bonus} bonus credits
                              </div>
                            )}
                            {pkg.loyaltyBonus > 0 && (
                              <div className="text-yellow-400 flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                +{pkg.loyaltyBonus} loyalty bonus
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-white">
                                ${pkg.price}
                              </span>
                              {pkg.discountPercentage > 0 && (
                                <Badge variant="outline" className="text-green-400">
                                  {pkg.discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                            {pkg.originalPrice > pkg.price && (
                              <div className="text-sm text-gray-400 line-through">
                                ${pkg.originalPrice}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              ${pkg.pricePerCredit?.toFixed(3)}/credit
                            </div>
                          </div>

                          {pkg.totalCredits && (
                            <div className="mt-2 text-center">
                              <Badge className="bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                                Total: {pkg.totalCredits} credits
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
                  <TabsList className="grid grid-cols-5 w-full bg-white/5">
                    {paymentMethods.map((method: any) => (
                      <TabsTrigger
                        key={method.id}
                        value={method.id}
                        className="text-white/70 data-[state=active]:bg-purple-600"
                      >
                        {method.id === 'upi' && <Smartphone className="w-4 h-4 mr-1" />}
                        {method.id === 'paypal' && <CreditCard className="w-4 h-4 mr-1" />}
                        {method.id === 'razorpay' && <CreditCard className="w-4 h-4 mr-1" />}
                        {method.id === 'crypto' && <Bitcoin className="w-4 h-4 mr-1" />}
                        {method.id === 'bank_transfer' && <Building2 className="w-4 h-4 mr-1" />}
                        {method.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {paymentMethods.map((method: any) => (
                    <TabsContent key={method.id} value={method.id} className="mt-4">
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <p className="text-white/70">
                            {method.id === 'upi' && 'Pay instantly with UPI - no fees!'}
                            {method.id === 'paypal' && 'Secure payment with PayPal'}
                            {method.id === 'razorpay' && 'Pay with cards, wallets, or UPI via Razorpay'}
                            {method.id === 'crypto' && 'Pay with Bitcoin, Ethereum, or other cryptocurrencies'}
                            {method.id === 'bank_transfer' && 'Direct bank transfer with minimal fees'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Processing fee: {(method.processingFee * 100).toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Purchase Button */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-white">
                  {selectedPackage && (
                    <div>
                      <span className="text-sm text-gray-400">Total:</span>
                      <span className="text-2xl font-bold ml-2">${selectedPackage.price}</span>
                      <span className="text-sm text-gray-400 ml-2">
                        for {selectedPackage.totalCredits || selectedPackage.credits} credits
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={!selectedPackage || !selectedMethod}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Complete Purchase
                </Button>
              </div>

              {/* Regional pricing notice */}
              <div className="text-center text-xs text-gray-500">
                <p>Regional pricing active for {region} • 99.8% profit margin guaranteed</p>
                <p>Prices update dynamically based on demand and server load</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}