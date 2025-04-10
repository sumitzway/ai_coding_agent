import { useState } from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography, Paper, IconButton, Divider } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode | null;
}

const FileTreeItem = ({ 
  node, 
  level = 0, 
  onFileSelect,
  selectedFile
}: { 
  node: FileNode; 
  level?: number; 
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedFile === node;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node);
    }
  };

  const getFileIcon = () => {
    if (node.type === 'directory') {
      return isExpanded ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />;
    }
    
    // Different icons based on file extension
    const extension = node.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
        return <InsertDriveFileIcon sx={{ color: '#007acc' }} />;
      case 'jsx':
      case 'js':
        return <InsertDriveFileIcon sx={{ color: '#f7df1e' }} />;
      case 'css':
        return <InsertDriveFileIcon sx={{ color: '#264de4' }} />;
      case 'json':
        return <InsertDriveFileIcon sx={{ color: '#5b5b5b' }} />;
      default:
        return <InsertDriveFileIcon color="disabled" />;
    }
  };

  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        selected={isSelected}
        sx={{
          pl: level * 2,
          py: 0.5,
          minHeight: 36,
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {node.type === 'directory' ? (
            <IconButton 
              size="small" 
              sx={{ 
                p: 0,
                color: isSelected ? 'inherit' : undefined,
              }}
            >
              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          ) : null}
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32, color: isSelected ? 'inherit' : undefined }}>
          {getFileIcon()}
        </ListItemIcon>
        <ListItemText 
          primary={node.name} 
          primaryTypographyProps={{
            sx: { 
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: isSelected ? 'inherit' : undefined,
            }
          }}
        />
      </ListItem>
      {node.type === 'directory' && isExpanded && node.children && (
        <List disablePadding>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={child.name + index}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </List>
      )}
    </>
  );
};

const FileExplorer = ({ files, onFileSelect, selectedFile }: FileExplorerProps) => {
  return (
    <Paper 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
      elevation={1}
    >
      <Box sx={{ 
        p: 1.5, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FolderIcon color="primary" sx={{ fontSize: '1.2rem' }} />
        <Typography variant="subtitle2" fontWeight="medium">
          Project Files
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List disablePadding>
          {files.map((file, index) => (
            <FileTreeItem
              key={file.name + index}
              node={file}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default FileExplorer; 