import React from 'react';
import { AlertTriangle,TrendingUp, Calendar, UserCheck ,TrendingDown } from 'lucide-react';

const AlertCards = ({ lowCreditUsers, expiredPlans, newSignups }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-400 mr-2" size={20} />
          <span className="text-red-400 font-medium">Low Credit Users</span>
        </div>
        <p className="text-2xl font-bold text-white mt-2">{lowCreditUsers}</p>
        <p className="text-red-300 text-sm">Users with &lt; 10 credits</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-center">
          <Calendar className="text-yellow-400 mr-2" size={20} />
          <span className="text-yellow-400 font-medium">Expired Plans</span>
        </div>
        <p className="text-2xl font-bold text-white mt-2">{expiredPlans}</p>
        <p className="text-yellow-300 text-sm">Need renewal reminder</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center">
          <UserCheck className="text-blue-400 mr-2" size={20} />
          <span className="text-blue-400 font-medium">New Signups (7d)</span>
        </div>
        <p className="text-2xl font-bold text-white mt-2">{newSignups.last7d}</p>
        <div className="flex items-center mt-1">
          {newSignups.trend > 0 ? (
            <TrendingUp size={14} className="text-green-400 mr-1" />
          ) : (
            <TrendingDown size={14} className="text-red-400 mr-1" />
          )}
          <span className={`${newSignups.trend > 0 ? 'text-green-400' : 'text-red-400'} text-sm`}>
            {Math.abs(newSignups.trend)}% vs last week
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertCards;
