import { Card, CardContent, Typography, Box, IconButton, Tooltip, Button, ButtonGroup } from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  DragIndicator as DragIndicatorIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import TaskStatus from './TaskStatus';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const handleStatusChange = (newStatus) => {
    if (task.status !== newStatus) {
      onStatusChange(task._id, newStatus);
    }
  };

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <DragIndicatorIcon 
              sx={{ 
                color: 'text.secondary',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                '&:hover': { color: 'primary.main' },
              }} 
            />
            <Tooltip title={task.title} placement="top">
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: 500, 
                  wordBreak: 'break-word',
                  flexGrow: 1,
                }}
              >
                {task.title}
              </Typography>
            </Tooltip>
          </Box>
          <Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {task.description && (
          <Tooltip title={task.description} placement="top">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {task.description}
            </Typography>
          </Tooltip>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <TaskStatus task={task} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              bgcolor: 'action.hover',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {task.priority}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(task.dueDate).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant={task.status === 'completed' ? 'contained' : 'outlined'}
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleStatusChange('completed')}
          >
            Complete
          </Button>
          <Button
            size="small"
            variant={task.status === 'pending' ? 'contained' : 'outlined'}
            color="info"
            startIcon={<PendingIcon />}
            onClick={() => handleStatusChange('pending')}
          >
            Pending
          </Button>
        </Box>

        {task.aiSuggestions?.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {task.aiSuggestions.map((suggestion, index) => (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'info.main',
                  bgcolor: 'info.lighter',
                  p: 1,
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                • {suggestion}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
