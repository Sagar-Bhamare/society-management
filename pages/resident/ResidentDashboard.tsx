
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { INVOICES, COMPLAINTS, NOTICES } from '../../constants';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { CreditCard, ShieldAlert, Building, Calendar, FileText, ArrowRight, Bell, Wallet, CheckCircle, BarChart2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper to get a greeting based on the time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const quickLinks = [
    { to: '/resident/finances', icon: CreditCard, label: 'Pay Bills' },
    { to: '/resident/complaints', icon: MessageSquare, label: 'Raise Complaint' },
    { to: '/resident/amenities', icon: Building, label: 'Book Amenity' },
    { to: '/resident/notices', icon: FileText, label: 'View Notices' },
];

const pollResults = {
    'Ocean Blue': 45,
    'Warm Beige': 30,
    'Modern Gray': 25,
};

const ResidentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const myUnpaidInvoices = INVOICES.filter(i => 
        i.residentName.includes(user?.name || '###') && (i.status === 'Pending' || i.status === 'Overdue')
    );
    const latestUnpaidInvoice = myUnpaidInvoices.length > 0 ? myUnpaidInvoices[0] : null;

    const myOpenComplaintsCount = COMPLAINTS.filter(c => c.raisedBy.includes(user?.name || '###') && c.status === 'Open').length;
    
    // Mock data for upcoming booking
    const upcomingBooking = { name: 'Clubhouse', date: 'Aug 10, 2024', time: '5:00 PM - 7:00 PM' };

    const getNoticeIcon = (category: string) => {
        switch(category) {
            case 'Urgent': return <Bell className="text-red-500" size={20}/>;
            case 'Event': return <Calendar className="text-amber-500" size={20}/>;
            default: return <FileText className="text-blue-500" size={20}/>;
        }
    };

    const handleVote = () => {
        if (!selectedPollOption) {
            toast.error("Please select an option to vote.");
            return;
        }
        setHasVoted(true);
        toast.success("Thank you for your vote!");
    };
    
    return (
        <div className="space-y-8 animate-fade-in-fast">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-text-secondary dark:text-slate-400">Here's what's happening in your community today.</p>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Outstanding Dues Card */}
                <div className={`p-6 rounded-xl shadow-sm border ${latestUnpaidInvoice ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900' : 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900'}`}>
                    <div className="flex items-center gap-3">
                        {latestUnpaidInvoice ? <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" /> : <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                        <h3 className="font-semibold text-text-primary dark:text-slate-200">Outstanding Dues</h3>
                    </div>
                    {latestUnpaidInvoice ? (
                        <>
                            <p className="text-3xl font-bold text-text-primary dark:text-slate-100 mt-4">₹{latestUnpaidInvoice.amount.toLocaleString()}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Due: {latestUnpaidInvoice.dueDate}</p>
                            <button onClick={() => setIsPayModalOpen(true)} className="mt-4 flex items-center justify-center gap-2 text-sm bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition w-full">
                                Pay Now <ArrowRight size={16}/>
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-4">All Cleared!</p>
                            <p className="text-sm text-text-secondary dark:text-slate-400">No pending payments.</p>
                        </>
                    )}
                </div>
                 {/* My Complaints Card */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <h3 className="font-semibold text-text-primary dark:text-slate-200">My Complaints</h3>
                    </div>
                    <p className="text-3xl font-bold text-text-primary dark:text-slate-100 mt-4">{myOpenComplaintsCount}</p>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Open issues requiring attention.</p>
                    <Link to="/resident/complaints" className="mt-4 flex items-center justify-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 text-text-primary dark:text-slate-200 font-semibold py-2 px-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition w-full">
                        View Details
                    </Link>
                </div>
                 {/* Upcoming Booking Card */}
                 <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                        <h3 className="font-semibold text-text-primary dark:text-slate-200">Upcoming Booking</h3>
                    </div>
                    <p className="text-xl font-bold text-text-primary dark:text-slate-100 mt-4">{upcomingBooking.name}</p>
                    <p className="text-sm font-semibold text-primary dark:text-indigo-400">{upcomingBooking.date}</p>
                    <p className="text-sm text-text-secondary dark:text-slate-400">{upcomingBooking.time}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Links */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                         <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Quick Links</h2>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickLinks.map(link => (
                                <Link key={link.label} to={link.to} className="group text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700 hover:border-primary/50">
                                    <div className="w-12 h-12 mx-auto p-3 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                        <link.icon className="w-full h-full" />
                                    </div>
                                    <span className="font-semibold text-sm mt-3 block text-text-primary dark:text-slate-200">{link.label}</span>
                                </Link>
                            ))}
                         </div>
                    </div>

                    {/* Community Poll */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                        <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-2 flex items-center gap-2"><BarChart2 size={20}/> Community Poll</h2>
                        <p className="text-sm text-text-secondary dark:text-slate-400 mb-4">What color should we paint the clubhouse exterior?</p>
                        <div className="space-y-3">
                           {hasVoted ? (
                                <div className="space-y-2 pt-2">
                                    {Object.entries(pollResults).map(([option, result]) => (
                                        <div key={option}>
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <span className="font-medium text-text-primary dark:text-slate-200">{option}</span>
                                                <span className="font-semibold text-text-secondary dark:text-slate-400">{result}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                <div className="bg-primary h-2.5 rounded-full" style={{width: `${result}%`}}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           ) : (
                                Object.keys(pollResults).map(option => (
                                    <label key={option} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedPollOption === option ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                        <input type="radio" name="poll-option" value={option} checked={selectedPollOption === option} onChange={(e) => setSelectedPollOption(e.target.value)} className="form-radio text-primary focus:ring-primary" />
                                        <span className="text-sm font-medium text-text-primary dark:text-slate-200">{option}</span>
                                    </label>
                                ))
                           )}
                        </div>
                        <button onClick={handleVote} disabled={hasVoted} className="w-full mt-4 bg-primary text-white font-semibold py-2.5 px-4 rounded-full hover:bg-indigo-700 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {hasVoted ? 'Thanks for voting!' : 'Submit Vote'}
                        </button>
                    </div>
                </div>

                {/* Side Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                        <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4 flex items-center gap-2"><Bell size={20}/> Recent Notices</h2>
                        <div className="space-y-4">
                            {NOTICES.slice(0, 3).map(notice => (
                                <Link to="/resident/notices" key={notice.id} className="block group">
                                  <div className="flex items-start gap-3">
                                      <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 group-hover:bg-primary/10 transition-colors">
                                          {getNoticeIcon(notice.category)}
                                      </div>
                                      <div>
                                          <h3 className="font-semibold text-sm text-text-primary dark:text-slate-200 group-hover:text-primary transition-colors">{notice.title}</h3>
                                          <p className="text-xs text-text-secondary dark:text-slate-400">{notice.date}</p>
                                      </div>
                                  </div>
                                </Link>
                            ))}
                        </div>
                         <Link to="/resident/notices" className="mt-4 flex items-center justify-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 text-text-primary dark:text-slate-200 font-semibold py-2 px-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition w-full">
                           View All Notices
                        </Link>
                    </div>
                </div>
            </div>

            <Modal title="Pay Your Bill" isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)}>
                {latestUnpaidInvoice && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">You are paying for invoice <strong className="text-primary">{latestUnpaidInvoice.invoiceNumber}</strong>.</p>
                            <p className="text-3xl font-bold text-text-primary dark:text-slate-200 mt-1">₹{latestUnpaidInvoice.amount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs font-medium text-text-secondary dark:text-slate-400">Card Number</label>
                                <input type="text" placeholder="**** **** **** ****" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary dark:text-slate-400">Expiry Date</label>
                                    <input type="text" placeholder="MM / YY" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                </div>
                                 <div>
                                    <label className="text-xs font-medium text-text-secondary dark:text-slate-400">CVV</label>
                                    <input type="text" placeholder="***" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                </div>
                             </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsPayModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                            <button onClick={() => { setIsPayModalOpen(false); toast.success('Payment successful!'); }} type="button" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Confirm Payment</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ResidentDashboard;