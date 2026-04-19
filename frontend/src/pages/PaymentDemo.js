import React, { useState } from 'react';
import { CalendarMonth, AccountBalanceWallet, Stars, LocalOffer, CheckCircle } from '@mui/icons-material';

const PaymentDemo = () => {
    const [points, setPoints] = useState(12);
    const [discountApplied, setDiscountApplied] = useState(false);

    const baseFee = 15000;
    const pointValueLKR = 100;

    // Next Payment Details
    const nextPaymentDate = "April 05, 2026";
    const propertyName = "Greenwood Men's Hostel";
    const roomType = "Double Shared Room";

    const discountAmount = 12 * pointValueLKR;
    const finalFee = discountApplied ? baseFee - discountAmount : baseFee;

    const handleUsePoints = () => {
        if (points >= 12 && !discountApplied) {
            setPoints(points - 12);
            setDiscountApplied(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Payment Dashboard</h1>
                    <p className="mt-2 text-md text-gray-600">Review your payment details and apply loyalty points.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Payment Details Card */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                        <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Next Payment Due</p>
                                <div className="flex items-center gap-2 text-white">
                                    <CalendarMonth className="opacity-80" />
                                    <span className="text-2xl font-bold tracking-tight">{nextPaymentDate}</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <AccountBalanceWallet className="text-white" fontSize="large" />
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Payment Details</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Property</span>
                                    <span className="text-gray-900 font-bold">{propertyName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Room Type</span>
                                    <span className="text-gray-900 font-bold">{roomType}</span>
                                </div>

                                <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Base Boarding Fee</span>
                                        <span className="font-semibold text-gray-800">LKR {baseFee.toLocaleString()}</span>
                                    </div>

                                    {discountApplied && (
                                        <div className="flex justify-between items-center mb-2 text-green-600">
                                            <span className="flex items-center gap-1"><LocalOffer fontSize="small" /> Loyalty Discount (12 pts)</span>
                                            <span className="font-bold">- LKR {discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                        <span className="text-lg font-bold text-gray-900">Total Amount Due</span>
                                        <span className="text-2xl font-extrabold text-blue-600">LKR {finalFee.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                Pay Now
                            </button>
                        </div>
                    </div>

                    {/* Loyalty Points Side Card */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow shadow-purple-900/20 text-white overflow-hidden relative">

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>

                            <div className="p-6 relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Stars className="text-yellow-300" />
                                    <h3 className="font-bold tracking-wide">EasyStay Rewards</h3>
                                </div>

                                <div className="mb-6">
                                    <p className="text-purple-100 text-sm mb-1">Your Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black">{points}</span>
                                        <span className="text-purple-200 font-medium">Points</span>
                                    </div>
                                </div>

                                {discountApplied ? (
                                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                                        <CheckCircle className="text-green-300 mb-2" fontSize="large" />
                                        <span className="font-semibold text-white">Discount Applied!</span>
                                        <span className="text-xs text-purple-200 mt-1">LKR {discountAmount} saved</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="w-full bg-black/20 rounded-full h-2.5 mb-2">
                                            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${Math.min((points / 12) * 100, 100)}%` }}></div>
                                        </div>
                                        <p className="text-xs text-purple-200 mb-4 text-center">
                                            {points >= 12 ? 'You have enough points to unlock a discount!' : `Earn ${12 - points} more points for a discount.`}
                                        </p>

                                        <button
                                            onClick={handleUsePoints}
                                            disabled={points < 12}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${points >= 12
                                                    ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-900 shadow-lg'
                                                    : 'bg-white/20 text-white cursor-not-allowed'
                                                }`}
                                        >
                                            <LocalOffer fontSize="small" />
                                            {points >= 12 ? 'Use 12 Points (-LKR 1,200)' : 'Keep Earning'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Snippet */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                            <h4 className="font-semibold text-blue-900 mb-2 text-sm">How to earn points?</h4>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Pay your boarding fee on time through EasyStay. Once the host verifies your payment slip, you automatically earn 1 point! 1 point equals LKR 100 in value.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDemo;
