"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function WebIntegrationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const htmlOverlaySnippet = `<!-- Horizon Chat -->
<div id="horizon-chat"></div>
<script src="https://tripbuilder.ai/widget.js" defer></script>
<script>
  window.HorizonConfig = {
    orgSlug: "visit-fort-myers"
  };
</script>`;

  const disclaimerSnippet = `<a href="https://mindtrip.ai/chat" id="powered-by-Modglip-org-check-important-info">Info</a>`;

  const openChatSnippet = `<a href="javascript:void(0)" onclick="window.Horizon?.openChat()">
  Start the overlay to let a user view a message window and new user consent. You must provide on your TOS
  the link to which to chat to give info for chat & private rights requested.
</a>`;

  const aiSearchSnippet = `<a href="javascript:void(0)" onclick="window.Horizon?.openChat({
  userInput: 'Your query goes here',
  context: {autoSearch: true},
  onClose: () => {console.log('Chat closed')}
})">
  Search with AI
</a>`;

  const samplePromptSnippet = `<a href="javascript:void(0)" onclick="window.Horizon?.openChat({
  promptExample: true
})">
  Show Sample Prompts
</a>`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Web Integration" subtitle="Visit Fort Myers • Live since August 2024" showDateRange={false} />

      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Chat Overlay Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">
              Chat Overlay <span className="text-sm font-normal text-gray-500">(Advanced)</span>
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Adds the Chat overlay in a tooltip in the Trip Planner button and heading. It can be positioned in any z-
            position and can make your pages AI-ready 3 JS + HTML + CSS
          </p>
          <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
            <button
              onClick={() => copyToClipboard(htmlOverlaySnippet, 'overlay')}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              {copiedSection === 'overlay' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <pre className="text-sm text-gray-800 overflow-x-auto">
              <code>{htmlOverlaySnippet}</code>
            </pre>
          </div>
        </section>

        {/* Disclaimer Notice */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Disclaimer Notice</h2>
          <p className="text-sm text-gray-600 mb-4">
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              a href="https://mindtrip.ai/chat" id="powered-by-Modglip-org-check-important-info"&gt;Info&lt;/a&gt;
            </code>
          </p>
        </section>

        {/* User Engagement Paths */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">
              User Engagement Paths <span className="text-sm font-normal text-gray-500">(Advanced)</span>
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            These shortages let you choice ways to customize the incoming &itinerary&lt;
          </p>

          <div className="space-y-6">
            {/* Open Chat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Open Chat</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">See</button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Opens the overlay to let a user view a message window and new user consent. You must provide on your TOS
                the link to which to chat to give info for chat & private rights requested.
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                <button
                  onClick={() => copyToClipboard(openChatSnippet, 'openChat')}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                >
                  {copiedSection === 'openChat' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  <code>{openChatSnippet}</code>
                </pre>
              </div>
            </div>

            {/* AI Search / Find */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">AI Search / Find</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Opens AI search with a pre-filled query and automatically executes the search.
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                <button
                  onClick={() => copyToClipboard(aiSearchSnippet, 'aiSearch')}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                >
                  {copiedSection === 'aiSearch' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  <code>{aiSearchSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Sample Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Sample Prompt</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">See</button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Opens the sample prompts dialog.
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                <button
                  onClick={() => copyToClipboard(samplePromptSnippet, 'samplePrompt')}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                >
                  {copiedSection === 'samplePrompt' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  <code>{samplePromptSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Create Trip</h3>
                <p className="text-sm text-gray-600">Opens an AI-ready screen to ask users if feedback.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Define Trip Input Fields</h3>
                <p className="text-sm text-gray-600">Shows if docs...</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Open a Create Trip Dialog</h3>
                <p className="text-sm text-gray-600">Opens a create trip dialog</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Open Guide</h3>
                <p className="text-sm text-gray-600">Opens the website to see an old and/or to readers guide.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">View a Guide</h3>
                <p className="text-sm text-gray-600">Show/Load guide.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Create a Trip from a Guide</h3>
                <p className="text-sm text-gray-600">
                  Have a user copy content to it as a trip. Based on your with an opt-in.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Open Place</h3>
                <p className="text-sm text-gray-600">
                  Opens the website to see a full about a specific place. Show the other basic page and things relative to
                  it to view more.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">View a Place</h3>
                <p className="text-sm text-gray-600">Show/Load specific...</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Ask AI about a Place</h3>
                <p className="text-sm text-gray-600">
                  Opens a chat with you and asks about a specific place for placement ...you can block it, about it.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Create Magic Link</h3>
                <p className="text-sm text-gray-600">
                  Have a lead to place them to see scratch to one and connecting to send as once of this and.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inline Links */}
        <section>
          <div className="flex items-center gap-4 mb-4 border-b border-gray-200">
            <button className="pb-2 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
              Yes
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Link
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              External
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Internal
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Open Chat</h3>
              <p className="text-sm text-gray-600 mb-2">
                Opens a user index to a one-page chat when the clicking on a link in a chat or in a specific page, without
                needing external user.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-sm text-gray-800">
                  <a href="https://tripbuilder.ai/chat?slug=Destination" className="text-blue-600">
                    Link
                  </a>
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Open Chat with a Prompt</h3>
              <p className="text-sm text-gray-600 mb-2">
                Pass a user prompt on a link a search to let it load a local chat.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-sm text-gray-800">
                  <a
                    href="https://tripbuilder.ai/chat?slug=visit-fort-myers&q=What%20are%20fun%20things%20to%20do"
                    className="text-blue-600"
                  >
                    Link
                  </a>
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Open Guide</h3>
              <p className="text-sm text-gray-600 mb-2">
                Have a guide linked without a guide builder in
                {' '}
                <a href="https://mindtrip.ai/guides/build" className="text-blue-600 hover:underline">
                  mindtrip.ai/guides/build
                </a>
              </p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-sm text-gray-800">
                  <a href="https://tripbuilder.ai/chat?slug=visit-fort-myers?id=123abc" className="text-blue-600">
                    Link
                  </a>
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Open Place</h3>
              <p className="text-sm text-gray-600 mb-2">
                Have a directly open a place a place sheet in a trip or a guide to visitors the area.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-sm text-gray-800">
                  <a
                    href="https://tripbuilder.ai/chat?slug=visit-fort-myers&place=ChIJo8dI4kQH_U4ReI93KOCY_E0&name=Donner+Lake"
                    className="text-blue-600"
                  >
                    Link
                  </a>
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* JavaScript API */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">JavaScript API</h2>
          <p className="text-sm text-gray-600 mb-6">
            Facility for developers, loaded an event handler or give you the option to web-note.
          </p>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Function / Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Parameters
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Return
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onLoad</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      The event is required once the buttons widget
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onChange</td>
                    <td className="px-4 py-3 text-sm text-gray-600">status</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      This event is reported everytime the button status is changed... Open or close.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">openChat</td>
                    <td className="px-4 py-3 text-sm text-gray-600">options?</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      To start a new chat overlay, the options are optional.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">closeChat</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Closes the chat overlay</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onChatOpen</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">string</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Event is fired whenever chat is opened... (chat-id, e.g.,12)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onChatClose</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">string</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      E.g. is message any... chat is closed... (string-chat-id, e.g., 12)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onPlaceOpen</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">string</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Event is fired whenever a place is opened... (place-id)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">onPlaceClose</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">string</td>
                    <td className="px-4 py-3 text-sm text-gray-600">No</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Event is fired whenever a place is closed... (place-id)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">getState</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">object</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Get all the current event including the container for system
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Example:</h3>
            <pre className="text-sm text-gray-800 overflow-x-auto bg-gray-50 p-4 rounded">
              <code>{`window.addEventListener('load', () => {
  if (window.Horizon) {
    window.Horizon.onLoad = () => {
      console.log('Trip Planner loaded!');
    };
    
    window.Horizon.onChange = (status) => {
      console.log('Status:', status);
    };
  }
});`}</code>
            </pre>
          </div>

          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">initClient</h3>
            <pre className="text-sm text-gray-800 overflow-x-auto bg-gray-50 p-4 rounded">
              <code>{`window.Horizon.initClient({buttonMode: 'tip-button'});`}</code>
            </pre>
          </div>

          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">isMobile</h3>
            <pre className="text-sm text-gray-800 overflow-x-auto bg-gray-50 p-4 rounded">
              <code>{`window.Horizon.isMobile()`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

