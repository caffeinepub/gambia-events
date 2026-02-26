import { useEffect, useRef } from 'react';
import { Ticket, Event } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEventDate } from '../lib/utils';
import { MapPin, Calendar, Download, Share2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DigitalTicketViewProps {
  ticket: Ticket;
  event?: Event | null;
  compact?: boolean;
}

export default function DigitalTicketView({ ticket, event, compact = false }: DigitalTicketViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode(ticket.bookingCode, canvasRef.current);
  }, [ticket.bookingCode]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(ticket.bookingCode);
      toast.success('Booking code copied to clipboard!');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const isConfirmed = ticket.paymentStatus === 'confirmed';

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <canvas
          ref={canvasRef}
          width={80}
          height={80}
          className="rounded-lg shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{event?.title ?? ticket.eventId}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {event ? formatEventDate(event.datetime) : ''}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={isConfirmed ? 'default' : 'secondary'}
              className={`text-xs ${isConfirmed ? 'bg-success text-success-foreground' : ''}`}
            >
              {isConfirmed ? '✓ Confirmed' : '⏳ Pending'}
            </Badge>
            <span className="text-xs text-muted-foreground">×{Number(ticket.quantity)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <img
            src="/assets/generated/app-logo.dim_128x128.png"
            alt="Gambia Events"
            className="w-6 h-6 rounded object-cover"
          />
          <span className="text-sm font-semibold opacity-90">Gambia Events</span>
        </div>
        <h2 className="font-display font-bold text-xl leading-tight">
          {event?.title ?? 'Event Ticket'}
        </h2>
      </div>

      {/* Ticket Body */}
      <div className="px-6 py-4 space-y-3">
        {event && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>{formatEventDate(event.datetime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>{event.city} · {event.location}</span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-bold text-lg">{Number(ticket.quantity)} ticket{Number(ticket.quantity) > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-1">
              {isConfirmed ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Clock className="w-4 h-4 text-gold" />
              )}
              <span className={`font-semibold text-sm ${isConfirmed ? 'text-success' : 'text-gold'}`}>
                {isConfirmed ? 'Confirmed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider with notches */}
      <div className="relative flex items-center px-4">
        <div className="w-5 h-5 rounded-full bg-background border-2 border-primary/20 -ml-6" />
        <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-2" />
        <div className="w-5 h-5 rounded-full bg-background border-2 border-primary/20 -mr-6" />
      </div>

      {/* QR Code Section */}
      <div className="px-6 py-4 flex flex-col items-center gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <canvas ref={canvasRef} width={160} height={160} />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Booking Code</p>
          <p className="font-mono text-xs font-bold text-foreground/70 mt-0.5 break-all">
            {ticket.bookingCode.substring(0, 24)}...
          </p>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="flex-1 gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple QR code generator using canvas
function generateQRCode(text: string, canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = canvas.width;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Create a simple visual representation using the text hash
  const hash = simpleHash(text);
  const gridSize = 21;
  const cellSize = size / gridSize;

  ctx.fillStyle = '#1a0a00';

  // Generate a deterministic pattern from the hash
  const bits = generateBits(hash, gridSize * gridSize);

  // Draw finder patterns (corners)
  drawFinderPattern(ctx, 0, 0, cellSize);
  drawFinderPattern(ctx, (gridSize - 7) * cellSize, 0, cellSize);
  drawFinderPattern(ctx, 0, (gridSize - 7) * cellSize, cellSize);

  // Draw data modules
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Skip finder pattern areas
      if (isFinderArea(row, col, gridSize)) continue;

      const idx = row * gridSize + col;
      if (bits[idx % bits.length]) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
  // Outer square (7x7)
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
  // White inner (5x5)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
  // Dark center (3x3)
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
}

function isFinderArea(row: number, col: number, gridSize: number): boolean {
  return (
    (row < 8 && col < 8) ||
    (row < 8 && col >= gridSize - 8) ||
    (row >= gridSize - 8 && col < 8)
  );
}

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateBits(seed: number, count: number): boolean[] {
  const bits: boolean[] = [];
  let state = seed;
  for (let i = 0; i < count; i++) {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    bits.push((state & 1) === 1);
  }
  return bits;
}
