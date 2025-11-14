"use client";

interface FunnelProps {
  title: string;
  stages: {
    label: string;
    value: number;
    percentage?: number;
  }[];
  finalConversion: {
    percentage: number;
    label: string;
  };
}

function FunnelChart({ title, stages, finalConversion }: FunnelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-6">{title}</h3>
      
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const width = 100 - (index * 15); // Decreasing width for funnel effect
          
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <div 
                  className="relative bg-gradient-to-r from-blue-500 to-blue-400 rounded py-3 transition-all duration-300 hover:shadow-md"
                  style={{ width: `${width}%` }}
                >
                  <div className="text-center">
                    <span className="text-sm font-medium text-white">{stage.label}</span>
                  </div>
                </div>
              </div>
              <div className="w-20 text-right">
                <p className="text-sm font-semibold text-gray-900">{stage.value.toLocaleString()}</p>
                {stage.percentage && (
                  <p className="text-xs text-gray-500">{stage.percentage}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="text-sm text-gray-600">{finalConversion.label}</span>
          <span className="text-2xl font-bold text-blue-600">{finalConversion.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

export default function ConversionRates() {
  const onboardToChat = {
    title: 'Onboard to Chat Message',
    stages: [
      { label: 'Onboard Opened', value: 1139 },
      { label: 'Chat Message Sent', value: 328 },
    ],
    finalConversion: {
      percentage: 28.8,
      label: 'Conversion Rate:'
    }
  };

  const onboardToItinerary = {
    title: 'Onboard to Itinerary Created',
    stages: [
      { label: 'Onboard Opened', value: 1139 },
      { label: 'Itinerary Created', value: 328 },
    ],
    finalConversion: {
      percentage: 28.8,
      label: 'Conversion Rate:'
    }
  };

  const onboardToRegister = {
    title: 'Onboard to Register',
    stages: [
      { label: 'Onboard Opened', value: 1139 },
      { label: 'User Registered', value: 3 },
    ],
    finalConversion: {
      percentage: 0.3,
      label: 'Conversion Rate:'
    }
  };

  const onboardToPartner = {
    title: 'Onboard to Partner Handoff',
    stages: [
      { label: 'Onboard Opened', value: 1139 },
      { label: 'Clicked OTA Partner', value: 30 },
    ],
    finalConversion: {
      percentage: 2.6,
      label: 'Conversion Rate:'
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Conversion Rates</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart {...onboardToChat} />
        <FunnelChart {...onboardToItinerary} />
        <FunnelChart {...onboardToRegister} />
        <FunnelChart {...onboardToPartner} />
      </div>
    </div>
  );
}

