import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Collapse, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'prompt' | 'response' | 'modification';
}

interface ErrorLog {
  message: string;
  timestamp: Date;
  details?: string;
}

interface PromptPaneProps {
  onPromptSubmit: (prompt: string, isModification: boolean) => void;
}

const PromptPane = ({ onPromptSubmit }: PromptPaneProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI assistant powered by OpenAI. I can help you create and modify React Native components. Just describe what component you'd like to create or how you'd like to modify existing code.",
      isUser: false,
      timestamp: new Date(),
      type: 'response'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setLoading(true);
      setError(null);
      
      // Add user message
      const userMessage: Message = {
        text: prompt,
        isUser: true,
        timestamp: new Date(),
        type: prompt.toLowerCase().includes('modify') || prompt.toLowerCase().includes('change') ? 'modification' : 'prompt'
      };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        const isModification = prompt.toLowerCase().includes('modify') || prompt.toLowerCase().includes('change');
        await onPromptSubmit(prompt, isModification);
        
        // Add AI response
        const aiMessage: Message = {
          text: isModification 
            ? "I've modified the code according to your request. You can see the changes in the code editor."
            : "I've generated the code based on your request. You can find it in the code editor.",
          isUser: false,
          timestamp: new Date(),
          type: 'response'
        };
        setMessages(prev => [...prev, aiMessage]);
        setPrompt('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setErrorLogs(prev => [...prev, {
          message: errorMessage,
          timestamp: new Date(),
          details: err instanceof Error ? err.stack : undefined
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearErrorLogs = () => {
    setErrorLogs([]);
    setError(null);
  };

  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Chat with AI Assistant
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Powered by OpenAI
        </Typography>
        {errorLogs.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setShowErrorLog(!showErrorLog)}
              color="error"
            >
              {showErrorLog ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={clearErrorLogs}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Collapse in={showErrorLog && errorLogs.length > 0}>
        <Paper 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'error.dark',
            color: 'error.contrastText',
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ErrorOutlineIcon /> Error Log
          </Typography>
          <List dense>
            {errorLogs.map((log, index) => (
              <ListItem key={index} sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                borderLeft: '2px solid',
                borderColor: 'error.main',
                pl: 2,
                mb: 1
              }}>
                <ListItemText 
                  primary={log.message}
                  secondary={
                    <>
                      <Typography variant="caption" component="span">
                        {log.timestamp.toLocaleString()}
                      </Typography>
                      {log.details && (
                        <Typography 
                          variant="caption" 
                          component="pre" 
                          sx={{ 
                            mt: 1, 
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          {log.details}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      {error && !showErrorLog && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              size="small"
              onClick={() => setShowErrorLog(true)}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ 
              flexDirection: 'column', 
              alignItems: message.isUser ? 'flex-end' : 'flex-start',
              padding: '8px 16px'
            }}>
              <Paper sx={{ 
                p: 2, 
                maxWidth: '80%',
                bgcolor: message.isUser ? 'primary.main' : 'background.paper',
                color: message.isUser ? 'white' : 'text.primary',
                borderLeft: message.type === 'modification' ? '4px solid' : 'none',
                borderColor: 'warning.main'
              }}>
                <ListItemText 
                  primary={message.text}
                  secondary={message.timestamp.toLocaleTimeString()}
                  secondaryTypographyProps={{ 
                    color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}
                />
              </Paper>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mb: 2 }} />
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message or request code modifications..."
            variant="outlined"
            size="small"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={!prompt.trim() || loading}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PromptPane; 