import React, { useState, useMemo } from 'react';
import { AMENITIES } from '../../constants';
import type { Amenity } from '../../types';
import Modal from '../../components/Modal';
import LazyImage from '../../components/Image';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, X, PartyPopper } from 'lucide-react';

interface Booking {
  id: string;
  amenityId: string;
  amenityName: string;
  date: string;
  timeSlot: string;
}

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
  '07:00 PM - 09:00 PM',
];

const AmenityBooking: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'booking-1', amenityId: 'am-3', amenityName: 'Swimming Pool', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot: '03:00 PM - 05:00 PM' },
  ]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('');

  const handleBookClick = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setBookingDate('');
    setBookingTimeSlot('');
    setIsModalOpen(true);
  };
  
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !bookingDate || !bookingTimeSlot) {
      toast.error('Please select a date and time slot.');
      return;
    }
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
    };
    setBookings(prev => [newBooking, ...prev]);
    setIsModalOpen(false);
    toast.success(`Booking confirmed for ${selectedAmenity.name}!`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
    toast.success('Booking cancelled successfully.');
  };

  const today = new Date().toISOString().split('T')[0];

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const upcoming = bookings.filter(b => b.date >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = bookings.filter(b => b.date < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings, today]);
  
  const BookingCard: React.FC<{ booking: Booking, isPast?: boolean }> = ({ booking, isPast = false }) => (
    <div className={`bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-text-primary dark:text-slate-200">{booking.amenityName}</h4>
        {!isPast && (
          <button onClick={() => handleCancelBooking(booking.id)} className="text-slate-400 hover:text-red-500" title="Cancel Booking">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="mt-2 space-y-1 text-sm text-text-secondary dark:text-slate-400">
        <p className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="flex items-center gap-2"><Clock size={14} /> {booking.timeSlot}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Book an Amenity</h1>
        <p className="text-text-secondary dark:text-slate-400 mt-1">Choose from available facilities and book your slot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {AMENITIES.map(amenity => (
          <div key={amenity.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden group flex flex-col">
            <div className="relative h-48">
              <LazyImage src={amenity.image} alt={amenity.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-text-primary dark:text-slate-200">{amenity.name}</h2>
              <p className="text-text-secondary dark:text-slate-400 mt-2 mb-4 flex-grow">{amenity.description}</p>
              <button onClick={() => handleBookClick(amenity)} className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-full hover:bg-indigo-700 transition duration-300 mt-auto">
                Check Availability & Book
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* My Bookings Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-text-primary dark:text-slate-200">My Bookings</h2>
        
        <div>
          <h3 className="font-semibold text-lg text-text-primary dark:text-slate-300 mb-3">Upcoming</h3>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
              <PartyPopper className="mx-auto text-primary" size={32} />
              <p className="mt-2 text-text-secondary dark:text-slate-400">No upcoming bookings. Time to plan something!</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-text-primary dark:text-slate-300 mb-3">Past Bookings</h3>
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.map(b => <BookingCard key={b.id} booking={b} isPast />)}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-text-secondary dark:text-slate-400">No past booking history.</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedAmenity && (
        <Modal title={`Book ${selectedAmenity.name}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
           <form className="space-y-4" onSubmit={handleConfirmBooking}>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Select Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={today}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Select Time Slot</label>
                 <select 
                   value={bookingTimeSlot}
                   onChange={e => setBookingTimeSlot(e.target.value)}
                   required
                   className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                 >
                    <option value="" disabled>-- Choose a time --</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                 </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Confirm Booking</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default AmenityBooking;