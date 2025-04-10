import { Paper, Typography, Box, IconButton } from '@mui/material';
import { useEffect, useState, useMemo, useCallback } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PreviewPaneProps {
  code: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

// We're using an iframe with Tailwind CSS for the preview now

const PreviewPane = ({ code, refreshKey, onRefresh }: PreviewPaneProps) => {
  const [previewCode, setPreviewCode] = useState(code);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  // Update preview code when code, refreshKey, or localRefreshKey changes
  useEffect(() => {
    // Always update the preview code when the code prop changes
    setPreviewCode(code);
  }, [code, refreshKey, localRefreshKey]);

  const handleRefresh = useCallback(() => {
    // Increment local refresh key to force re-render
    setLocalRefreshKey(prev => prev + 1);
    
    // Also call the parent's refresh handler if provided
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Function to create a visual preview based on the code
  const createIframeContent = useCallback((code: string) => {
    // Analyze the code to determine what kind of component it is
    const isLoginComponent = code.toLowerCase().includes('login') || code.toLowerCase().includes('sign in');
    const isFormComponent = code.toLowerCase().includes('form') || code.toLowerCase().includes('input');
    const isListComponent = code.toLowerCase().includes('list') || code.toLowerCase().includes('items');
    const isDashboardComponent = code.toLowerCase().includes('dashboard') || code.toLowerCase().includes('analytics');
    
    // Create HTML content based on the component type
    let previewHtml = '';
    
    if (isLoginComponent) {
      previewHtml = `
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password">
            </div>
            <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Sign In</button>
            <div class="text-center mt-4">
              <a href="#" class="text-sm text-blue-500 hover:underline">Forgot password?</a>
            </div>
          </div>
        </div>
      `;
    } else if (isFormComponent) {
      previewHtml = `
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Contact Form</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name">
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Message</label>
              <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Enter your message"></textarea>
            </div>
            <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Submit</button>
          </div>
        </div>
      `;
    } else if (isListComponent) {
      previewHtml = `
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Item List</h2>
          <ul class="divide-y divide-gray-200">
            <li class="py-4 flex">
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Item 1</p>
                <p class="text-sm text-gray-500">Description for item 1</p>
              </div>
            </li>
            <li class="py-4 flex">
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Item 2</p>
                <p class="text-sm text-gray-500">Description for item 2</p>
              </div>
            </li>
            <li class="py-4 flex">
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Item 3</p>
                <p class="text-sm text-gray-500">Description for item 3</p>
              </div>
            </li>
          </ul>
        </div>
      `;
    } else if (isDashboardComponent) {
      previewHtml = `
        <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Dashboard</h2>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow">
              <p class="text-sm text-gray-500">Total Users</p>
              <p class="text-2xl font-bold">1,234</p>
              <p class="text-sm text-green-500">+5.3%</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <p class="text-sm text-gray-500">Revenue</p>
              <p class="text-2xl font-bold">$12,345</p>
              <p class="text-sm text-red-500">-2.1%</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <p class="text-sm text-gray-500">Conversion Rate</p>
              <p class="text-2xl font-bold">12.3%</p>
              <p class="text-sm text-green-500">+1.2%</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <p class="text-sm text-gray-500">Active Sessions</p>
              <p class="text-2xl font-bold">432</p>
              <p class="text-sm text-green-500">+8.7%</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Default component preview
      previewHtml = `
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Next.js Component</h2>
          <div class="text-center">
            <p class="mb-4">Count: 0</p>
            <div class="flex justify-center space-x-4">
              <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Decrease</button>
              <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Increase</button>
            </div>
          </div>
        </div>
      `;
    }
    
    // Create a basic HTML structure with Tailwind CSS
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Next.js Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
          }
        </style>
      </head>
      <body>
        ${previewHtml}
      </body>
      </html>
    `;
  }, []);

  // Use useMemo to optimize rendering performance
  const previewContent = useMemo(() => {
    console.log("Rendering preview with code:", previewCode.substring(0, 50) + "...");
    
    if (!previewCode) {
      return (
        <Typography variant="body2" color="text.secondary">
          Enter a prompt to generate Next.js code
        </Typography>
      );
    }

    // Create an iframe to display the preview
    return (
      <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <iframe
          srcDoc={createIframeContent(previewCode)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Next.js Component Preview"
          sandbox="allow-scripts"
        />
      </Box>
    );
  }, [previewCode, localRefreshKey, createIframeContent]);

  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Preview
        <IconButton onClick={handleRefresh} size="small" title="Refresh preview">
          <RefreshIcon />
        </IconButton>
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          borderRadius: 1,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {previewContent}
      </Box>
    </Paper>
  );
};

export default PreviewPane; 