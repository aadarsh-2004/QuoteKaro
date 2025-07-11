import { Plus, Edit, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useEstimates } from "../context/EstimateContext";
import { useUser } from "../context/UserContext";

function RecentEstimates() {
  const {userData} = useUser();
  const { estimates, loading } = useEstimates();
  if (loading || !estimates) return null;
  
  const recentEstimates = [...estimates]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent Estimates
        </h2>
        <Link
          to="/new-estimate"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Create New
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Client
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Occasion
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Amount
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Date
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...recentEstimates].slice(0, 5).map((estimate) => (
              <tr
                key={estimate._id}
                className="border-b border-gray-50 hover:bg-gray-25"
              >
                <td className="p-4">
                  <div className="font-medium text-gray-800">
                    {estimate.clientName}
                  </div>
                </td>
                <td className="p-4 text-gray-600">{estimate.functionName}</td>
                <td className="p-4 font-medium text-gray-800">
                  ₹{estimate.netTotal}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(estimate.startDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      estimate.status
                    )}`}
                  >
                    {estimate.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/edit-estimate/${estimate._id}`}
                    
                    
                      className="p-1 text-gray-600 hover:text-green-600"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      className="p-1 text-gray-600 hover:text-purple-600"
                      title="Send via WhatsApp"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentEstimates;
