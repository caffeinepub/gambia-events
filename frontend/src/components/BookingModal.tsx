import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useBookTickets } from '../hooks/useQueries';
import { Event, PaymentMethod, Ticket } from '../backend';
import { formatEventDate } from '../lib/utils';
import { Loader2, Minus, Plus, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { value: PaymentMethod.wave, label: 'Wave', icon: '📱', desc: 'Mobile money' },
  { value: PaymentMethod.africellMoney, label: 'Africell Money', icon: '📲', desc: 'Mobile money' },
  { value: PaymentMethod.qMoney, label: 'QMoney', icon: '💳', desc: 'Mobile money' },
  { value: PaymentMethod.cash, label: 'Cash', icon: '💵', desc: 'Pay at venue' },
];

interface BookingModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onSuccess: (ticket: Ticket) => void;
}

export default function BookingModal({ event, open, onClose, onSuccess }: BookingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.wave);
  const { mutate: bookTickets, isPending } = useBookTickets();

  const maxQuantity = Math.min(Number(event.ticketsRemaining), 10);
  const totalPrice = Number(event.ticketPrice) * quantity;
  const isFree = event.ticketPrice === BigInt(0);

  const handleConfirm = () => {
    bookTickets(
      { eventId: event.id, quantity: BigInt(quantity), paymentMethod },
      {
        onSuccess: (ticket) => {
          toast.success('Tickets booked successfully! 🎉');
          onSuccess(ticket);
        },
        onError: (err) => {
          toast.error(`Booking failed: ${err.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Book Tickets</DialogTitle>
          <DialogDescription>Complete your booking for this event.</DialogDescription>
        </DialogHeader>

        {/* Event Summary */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatEventDate(event.datetime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.city} · {event.location}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Price per ticket</span>
            <span className="font-bold text-primary">
              {isFree ? 'Free' : `GMD ${Number(event.ticketPrice).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Number of Tickets</Label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground ml-2">
              ({maxQuantity} available)
            </span>
          </div>
        </div>

        {/* Payment Method */}
        {!isFree && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="grid grid-cols-2 gap-2"
            >
              {PAYMENT_METHODS.map((pm) => (
                <div key={pm.value}>
                  <RadioGroupItem value={pm.value} id={pm.value} className="sr-only" />
                  <Label
                    htmlFor={pm.value}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-lg">{pm.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{pm.label}</p>
                      <p className="text-xs text-muted-foreground">{pm.desc}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Total */}
        {!isFree && (
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">
              GMD {totalPrice.toLocaleString()}
            </span>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || maxQuantity === 0} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Booking...
              </>
            ) : (
              `Confirm Booking${isFree ? '' : ` · GMD ${totalPrice.toLocaleString()}`}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
