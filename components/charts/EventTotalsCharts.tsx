"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate sample data with spikes
const generateDataWithSpikes = (points: number, baseMax: number, spikes: number[]) => {
  const data = [];
  const startDate = new Date('2025-10-14');
  
  for (let i = 0; i < points; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    let value = Math.floor(Math.random() * baseMax) + Math.floor(baseMax * 0.3);
    
    // Add spikes at specific points
    if (spikes.includes(i)) {
      value = value * 3 + Math.floor(Math.random() * baseMax);
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: value
    });
  }
  
  return data;
};

const onboardedData = generateDataWithSpikes(90, 80, [30, 60]);
const chatMessagesData = generateDataWithSpikes(90, 100, [25, 55, 75]);
const itinerariesData = generateDataWithSpikes(90, 60, [35, 65]);
const partnerVisitsData = generateDataWithSpikes(90, 50, [28, 58, 80]);

export default function EventTotalsCharts() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Event Totals</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Onboarded Opens */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Onboarded Opens</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={onboardedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total User Chat Messages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total User Chat Messages</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chatMessagesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Itineraries Created */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Itineraries Created</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={itinerariesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total OTA Partner Visits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total OTA Partner Visits</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={partnerVisitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

