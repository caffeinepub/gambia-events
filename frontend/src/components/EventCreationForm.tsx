import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useCreateEvent } from '../hooks/useQueries';
import { EventCategory, ExternalBlob } from '../backend';
import { getCategoryLabel } from '../lib/utils';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  EventCategory.music,
  EventCategory.festivals,
  EventCategory.culture,
  EventCategory.nightlife,
  EventCategory.comedy,
  EventCategory.fashion,
  EventCategory.community,
];

const CITIES = ['Banjul', 'Serrekunda', 'Bakau', 'Brikama', 'Other'];

interface EventCreationFormProps {
  onSuccess?: () => void;
}

export default function EventCreationForm({ onSuccess }: EventCreationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>(EventCategory.music);
  const [city, setCity] = useState('Banjul');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [ticketQuantity, setTicketQuantity] = useState('100');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !datetime || !location) {
      toast.error('Please fill in all required fields.');
      return;
    }

    let posterBlob: ExternalBlob;

    if (posterFile) {
      const arrayBuffer = await posterFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      posterBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    } else {
      posterBlob = ExternalBlob.fromURL('/assets/generated/hero-banner.dim_1440x500.png');
    }

    const datetimeMs = new Date(datetime).getTime();
    const datetimeNs = BigInt(datetimeMs) * BigInt(1_000_000);

    createEvent(
      {
        title,
        description,
        category,
        city,
        datetime: datetimeNs,
        location,
        ticketPrice: BigInt(Math.max(0, parseInt(ticketPrice) || 0)),
        ticketQuantity: BigInt(Math.max(1, parseInt(ticketQuantity) || 1)),
        posterImage: posterBlob,
      },
      {
        onSuccess: () => {
          toast.success('Event submitted for review! 🎉');
          setTitle('');
          setDescription('');
          setDatetime('');
          setLocation('');
          setTicketPrice('0');
          setTicketQuantity('100');
          setPosterFile(null);
          setPosterPreview(null);
          setUploadProgress(0);
          onSuccess?.();
        },
        onError: (err) => {
          toast.error(`Failed to create event: ${err.message}`);
          setUploadProgress(0);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Poster Upload */}
      <div className="space-y-2">
        <Label>Event Poster</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
          style={{ minHeight: '180px' }}
        >
          {posterPreview ? (
            <img src={posterPreview} alt="Poster preview" className="w-full h-48 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <ImageIcon className="w-10 h-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload poster</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Progress value={uploadProgress} className="h-1.5" />
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Gambia Music Festival 2026"
          required
          className="min-h-touch"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event..."
          rows={4}
          required
        />
      </div>

      {/* Category & City */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
            <SelectTrigger className="min-h-touch">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>City *</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="min-h-touch">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date/Time */}
      <div className="space-y-2">
        <Label htmlFor="datetime">Date & Time *</Label>
        <Input
          id="datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          required
          className="min-h-touch"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Venue / Location *</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Independence Stadium, Bakau"
          required
          className="min-h-touch"
        />
      </div>

      {/* Price & Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Ticket Price (GMD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            placeholder="0 for free"
            className="min-h-touch"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Ticket Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={ticketQuantity}
            onChange={(e) => setTicketQuantity(e.target.value)}
            required
            className="min-h-touch"
          />
        </div>
      </div>

      <Button type="submit" className="w-full min-h-touch" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Submit Event for Review
          </>
        )}
      </Button>
    </form>
  );
}
