import React, { useState } from 'react';

const LoyaltyDemo = () => {
    const [points, setPoints] = useState(11); // Start at 11 to quickly show the 12-point threshold
    const [slipUploaded, setSlipUploaded] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [logs, setLogs] = useState([]);

    const boardingFee = 15000;
    const pointValueLKR = 100;

    const addLog = (message) => {
        setLogs((prev) => [`${new Date().toLocaleTimeString()} - ${message}`, ...prev]);
    };

    const handleUploadSlip = () => {
        if (slipUploaded) {
            addLog("Slip already uploaded.");
            return;
        }
        setSlipUploaded(true);
        addLog("Student uploaded payment slip.");
    };

    const handleVerifyPayment = () => {
        if (!slipUploaded) {
            addLog("Cannot verify: No slip uploaded yet.");
            return;
        }
        if (paymentVerified) {
            addLog("Payment already verified this cycle.");
            return;
        }
        setPaymentVerified(true);
        setPoints(prev => prev + 1);
        addLog("Owner verified payment. 1 Loyalty Point added!");
    };

    const handleApplyDiscount = () => {
        if (points >= 12) {
            setPoints(prev => prev - 12);
            setDiscountApplied(true);
            addLog(`12 points redeemed! Discount of LKR ${12 * pointValueLKR} applied to next boarding fee.`);
        } else {
            addLog(`Cannot apply discount: Need 12 points, but only have ${points}.`);
        }
    };

    const handleResetCycle = () => {
        setSlipUploaded(false);
        setPaymentVerified(false);
        setDiscountApplied(false);
        addLog("New payment cycle started.");
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Loyalty Points Demo</h1>
                    <p className="text-lg text-gray-600">
                        A quick demonstration of the student-owner point system.
                    </p>
                </div>

                {/* Status Dashboard */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-around items-center gap-6">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Standard Boarding Fee</p>
                        <p className="text-3xl font-bold text-gray-900">LKR {boardingFee}</p>
                    </div>
                    <div className="hidden sm:block w-px h-16 bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Points</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-4xl font-black text-blue-600">{points}</span>
                            <span className="text-gray-500 font-medium">/ 12</span>
                        </div>
                    </div>
                    <div className="hidden sm:block w-px h-16 bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Next Fee (After Discount)</p>
                        <p className={`text-3xl font-bold ${discountApplied ? 'text-green-600' : 'text-gray-900'}`}>
                            LKR {discountApplied ? boardingFee - (12 * pointValueLKR) : boardingFee}
                        </p>
                    </div>
                </div>

                {/* Interactive Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Student View */}
                    <div className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                Student View
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Step 1: Pay Boarding Fee</h3>
                                <p className="text-sm text-gray-600 mb-4">Upload your payment slip to notify the boarding owner.</p>
                                <button
                                    onClick={handleUploadSlip}
                                    disabled={slipUploaded}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${slipUploaded ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}`}
                                >
                                    {slipUploaded ? 'Slip Uploaded' : 'Upload Payment Slip'}
                                </button>
                            </div>

                            <hr className="border-gray-100" />

                            <div className={`${points >= 12 && !discountApplied ? 'opacity-100' : 'opacity-50'}`}>
                                <h3 className="font-semibold text-gray-800 mb-2">Step 3: Redeem Points</h3>
                                <p className="text-sm text-gray-600 mb-4">Once you reach 12 points, you can use them to reduce your next boarding fee by LKR {12 * pointValueLKR}.</p>
                                <button
                                    onClick={handleApplyDiscount}
                                    disabled={points < 12 || discountApplied}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${(points < 12 || discountApplied) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'}`}
                                >
                                    {discountApplied ? 'Discount Applied!' : 'Use 12 Points for Discount'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Owner View */}
                    <div className="bg-white rounded-2xl shadow border border-purple-100 overflow-hidden">
                        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                            <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                                Boarding Owner View
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className={`${slipUploaded && !paymentVerified ? 'opacity-100' : 'opacity-50'}`}>
                                <h3 className="font-semibold text-gray-800 mb-2">Step 2: Verify Payment</h3>
                                <p className="text-sm text-gray-600 mb-4">Verify the uploaded slip to confirm the payment. This automatically awards 1 point to the student.</p>
                                <button
                                    onClick={handleVerifyPayment}
                                    disabled={!slipUploaded || paymentVerified}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${(!slipUploaded || paymentVerified) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'}`}
                                >
                                    {paymentVerified ? 'Payment Verified (Point Awarded)' : 'Verify Payment & Award Point'}
                                </button>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Next Month Cycle</h3>
                                <p className="text-sm text-gray-600 mb-4">Reset the payment cycle for the next month to test gaining points again.</p>
                                <button
                                    onClick={handleResetCycle}
                                    className="w-full py-3 rounded-xl font-bold bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                >
                                    Start New Month Cycle
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Activity Logs */}
                <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden max-h-64 flex flex-col">
                    <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                            System Activity Logs
                        </h2>
                        <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-white transition-colors">Clear</button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-2 flex-1 font-mono text-sm text-green-400">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 italic">No activity yet. Start by uploading a slip.</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="border-l-2 border-green-500/30 pl-3 py-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoyaltyDemo;
