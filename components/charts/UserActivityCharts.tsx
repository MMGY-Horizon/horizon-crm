"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate sample data
const generateData = (points: number, max: number) => {
  const data = [];
  const startDate = new Date('2025-10-14');
  
  for (let i = 0; i < points; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * max) + Math.floor(max * 0.2)
    });
  }
  
  return data;
};

const onboardData = generateData(90, 100);
const chatMessageData = generateData(90, 120);
const itineraryData = generateData(90, 80);
const partnerSiteData = generateData(90, 60);
const registrationData = generateData(90, 40);

export default function UserActivityCharts() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Unique Users</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Who Went Onboard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users Who Went Onboard</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={onboardData}>
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

        {/* Users Who Sent Chat Message */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users Who Sent Chat Message</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chatMessageData}>
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

        {/* Users Who Made an Itinerary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users Who Made an Itinerary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={itineraryData}>
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

        {/* Users Who Opened OTA Partner Site */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users Who Opened OTA Partner Site</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={partnerSiteData}>
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

      {/* User Registrations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">User Registrations</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={registrationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={10}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

