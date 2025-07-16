import { Calendar } from 'lucide-react';
import { useEstimates } from '../context/EstimateContext';


function MiniCalender() {
  const { estimates, loading  } = useEstimates();
  if (loading || !estimates) return null;
  
  // Filter and sort upcoming estimates by startDate
  const upcomingEstimates = estimates
    .filter(est => new Date(est.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5); // Show only top 5 upcoming

  // Format date to readable string
  const formatDate = (dateStr) => {
    const options = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', options);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Calendar size={20} className="text-gray-600" />
        <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
      </div>
      <div className="space-y-3">
        {upcomingEstimates.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming events</p>
        ) : (
          upcomingEstimates.map((est, index) => (
            <div
              key={est._id || index}
              className={`flex items-center gap-3 p-3 ${
                index % 2 === 0 ? 'bg-yellow-50' : 'bg-green-50'
              } rounded-lg`}
            >
              <div
                className={`w-2 h-2 ${
                  index % 2 === 0 ? 'bg-yellow-500' : 'bg-green-500'
                } rounded-full`}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {est.clientName || "Untitled Function"}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {est.functionName || "Untitled Function"}
                </div>

                <div className="text-xs text-gray-500">
                  {formatDate(est.startDate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MiniCalender;
