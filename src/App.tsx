import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Grid, Paper, IconButton, Tooltip, Alert, Tabs, Tab, CircularProgress } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import PromptPane from './components/PromptPane';
import CodeEditor from './components/CodeEditor';
import PreviewPane from './components/PreviewPane';
import FileExplorer from './components/FileExplorer';

import { generateReactNativeCode as generateAICode, modifyReactNativeCode as modifyAICode } from './services/openaiService';
import {
  generatePackageJson,
  generateTsConfig,
  generateTailwindConfig,
  generateLayoutFile,
  generateAuthProject,
  generateEcommerceProject,
  generateDashboardProject,
  generateBlogProject,
  generateBasicProject,
  generateGlobalCss
} from './services/projectTemplates';

/**
 * Generates fallback Next.js code when no API key is set
 * @param promptText The user's prompt text
 * @returns Generated code as a string
 */
function generateFallbackCode(promptText: string): string {
  // Common CSS styles are available but not used directly in this function
  const promptLower = typeof promptText === 'string' ? promptText.toLowerCase() : '';
  const isAuthProject = promptLower.includes('auth') || promptLower.includes('login');
  const isEcommerce = promptLower.includes('ecommerce') || promptLower.includes('shop');
  const isDashboardProject = promptLower.includes('dashboard') || promptLower.includes('admin');
  const isBlogProject = promptLower.includes('blog') || promptLower.includes('article');

  // Extract project name from prompt if possible
  const nameMatch = promptText.match(/([a-zA-Z]+)(?:\s+project|\s+app|\s+website)?/i);
  let projectName = nameMatch ? nameMatch[1] : 'NextApp';
  projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);

  // Generate project files based on the project type
  let projectFiles = [];

  // Add package.json
  projectFiles.push(generatePackageJson(projectName));
  
  // Add tsconfig.json
  projectFiles.push(generateTsConfig());
  
  // Add tailwind config
  projectFiles.push(generateTailwindConfig());
  
  // Add layout and page files
  projectFiles.push(generateLayoutFile(projectName));
  
  // Add specific project files based on type
  if (isAuthProject) {
    projectFiles = [...projectFiles, ...generateAuthProject(projectName)];
  } else if (isEcommerce) {
    projectFiles = [...projectFiles, ...generateEcommerceProject(projectName)];
  } else if (isDashboardProject) {
    projectFiles = [...projectFiles, ...generateDashboardProject(projectName)];
  } else if (isBlogProject) {
    projectFiles = [...projectFiles, ...generateBlogProject(projectName)];
  } else {
    // Default to a basic project
    projectFiles = [...projectFiles, ...generateBasicProject(projectName)];
  }
  
  // Add global CSS file
  projectFiles.push(generateGlobalCss());
  
  // Combine all files with file markers
  return projectFiles.join('\n\n');
}

/**
 * Common CSS styles used in generated Next.js components
 * This is exported so it can be used by the fallback code generator
 */
export const commonCssStyles = `/* Common styles for Next.js components */
.button {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #4338ca;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.description {
  color: #6b7280;
  margin-bottom: 2rem;
}`;

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

/**
 * Main App component
 */
function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'Project Files',
      type: 'directory',
      children: []
    }
  ]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const theme = createTheme({
    palette: {
      mode,
    },
  });

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const parseGeneratedCode = (code: string) => {
    const newFiles: FileNode[] = [
      {
        name: 'Project Files',
        type: 'directory',
        children: []
      }
    ];

    // If the code doesn't contain file markers, create a single file
    if (!code.includes('// FILE:')) {
      newFiles[0].children!.push({
        name: 'App.tsx',
        type: 'file',
        content: code
      });
      return newFiles;
    }

    // Split the code by file markers
    const sections = code.split(/\/\/ FILE:/);
    
    // Process each section
    sections.forEach(section => {
      // Skip empty sections
      if (!section.trim()) return;

      // Extract file path and content
      const lines = section.split('\n');
      const filePath = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      if (!filePath) return;

      // Split the path into parts
      const pathParts = filePath.split('/');
      let currentLevel = newFiles[0].children!;

      // Create directory structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        let dir = currentLevel.find(node => node.name === pathParts[i] && node.type === 'directory');
        if (!dir) {
          dir = { name: pathParts[i], type: 'directory', children: [] };
          currentLevel.push(dir);
        }
        currentLevel = dir.children!;
      }

      // Add the file
      const fileName = pathParts[pathParts.length - 1];
      const existingFile = currentLevel.find(node => node.name === fileName);
      
      if (!existingFile) {
        currentLevel.push({
          name: fileName,
          type: 'file',
          content: content
        });
      }
    });

    // Sort files and directories
    const sortNodes = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });
      nodes.forEach(node => {
        if (node.type === 'directory' && node.children) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(newFiles[0].children!);
    return newFiles;
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setGeneratedCode(file.content || '');
    }
  };

  const handlePromptSubmit = async (prompt: string, isModification: boolean) => {
    setError(null);
    setIsLoading(true);
    
    try {
      let code: string;
      
      if (isModification && selectedFile?.content) {
        code = await modifyAICode(selectedFile.content, prompt);
        if (selectedFile) {
          // Update the file content in the file tree
          const updatedFiles = [...files];
          const updateFileContent = (nodes: FileNode[]) => {
            for (const node of nodes) {
              if (node === selectedFile) {
                node.content = code;
                return true;
              }
              if (node.children && updateFileContent(node.children)) {
                return true;
              }
            }
            return false;
          };
          updateFileContent(updatedFiles);
          setFiles(updatedFiles);
        }
      } else {
        code = await generateAICode(prompt);
        console.log('Generated code:', code); // Debug log
        const newFiles = parseGeneratedCode(code);
        console.log('Parsed files:', JSON.stringify(newFiles, null, 2)); // Debug log
        setFiles(newFiles);
        
        // Select the first file if available
        const firstFile = findFirstFile(newFiles[0]);
        if (firstFile) {
          setSelectedFile(firstFile);
          setGeneratedCode(firstFile.content || '');
        } else {
          setSelectedFile(null);
          setGeneratedCode(code);
        }
      }
      
      handleRefreshPreview();
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find the first file in the tree
  const findFirstFile = (node: FileNode): FileNode | null => {
    if (node.type === 'file') {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const file = findFirstFile(child);
        if (file) {
          return file;
        }
      }
    }
    return null;
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
    if (selectedFile) {
      // Update the file content in the file tree
      const updatedFiles = [...files];
      const updateFileContent = (nodes: FileNode[]) => {
        for (const node of nodes) {
          if (node === selectedFile) {
            node.content = newCode;
            return true;
          }
          if (node.children && updateFileContent(node.children)) {
            return true;
          }
        }
        return false;
      };
      updateFileContent(updatedFiles);
      setFiles(updatedFiles);
    } else {
      // If no file is selected, create a new file structure
      const newFiles = parseGeneratedCode(newCode);
      setFiles(newFiles);
    }
    handleRefreshPreview();
  };

  /**
   * Refreshes the preview by incrementing the refresh key
   * This forces the PreviewPane component to re-render
   */
  const handleRefreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ height: '100vh', p: 0 }}>
        <Box sx={{ height: '100%', position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 2
          }}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} md={4} sx={{ p: 1, height: '100%' }}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isLoading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <PromptPane 
                  onPromptSubmit={handlePromptSubmit}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2} sx={{ p: 1, height: '100%' }}>
              <FileExplorer 
                files={files}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1, height: '100%' }}>
              <Paper sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Code Editor" />
                  <Tab label="Preview" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {activeTab === 0 ? (
                    <CodeEditor 
                      code={generatedCode} 
                      onCodeChange={handleCodeChange} 
                    />
                  ) : (
                    <PreviewPane 
                      code={generatedCode} 
                      onRefresh={handleRefreshPreview}
                      refreshKey={refreshKey}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
