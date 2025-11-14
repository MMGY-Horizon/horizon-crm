"use client";

export default function SummaryMetrics() {
  const metrics = [
    {
      value: '1,139',
      label: 'Sum of Onboard Completion and Chat Message',
      sublabel: ''
    },
    {
      value: '328',
      label: 'Sum of Itinerary Made and Send Chat Message',
      sublabel: ''
    },
    {
      value: '642',
      label: 'Sum of Onboarded Completion and Itinerary',
      sublabel: ''
    },
    {
      value: '30',
      label: 'Sum of Onboard and OTA Results',
      sublabel: ''
    },
    {
      value: '1,362',
      label: 'Sum of Total Itinerary Made',
      sublabel: ''
    },
    {
      value: '499',
      label: 'Sum of Total Chat Messages',
      sublabel: ''
    },
    {
      value: '806',
      label: 'Sum of Total Itinerary Created',
      sublabel: ''
    },
    {
      value: '62',
      label: 'Sum of Total OTA Results',
      sublabel: ''
    },
    {
      value: '3',
      label: 'Sum of Total Registrations',
      sublabel: ''
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Summary Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</p>
            <p className="text-sm text-gray-600 leading-tight">{metric.label}</p>
            {metric.sublabel && (
              <p className="text-xs text-gray-500 mt-1">{metric.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

