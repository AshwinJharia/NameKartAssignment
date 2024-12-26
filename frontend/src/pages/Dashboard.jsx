import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as InsightIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { DragDropContext } from 'react-beautiful-dnd';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

import TaskColumn from '../components/TaskColumn';
import TaskForm from '../components/TaskForm';
import AiInsightPanel from '../components/AiInsightPanel';
import NotificationSettings from '../components/NotificationSettings';

// Initialize socket connection
const socket = io('http://localhost:5000');

export default function Dashboard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [openNotificationSettings, setOpenNotificationSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Socket.IO event listeners
  useEffect(() => {
    // Listen for new notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Show toast for new notifications
      toast.success(notification.message, {
        icon: '🔔',
      });
    });

    // Listen for task updates
    socket.on('taskCreated', () => {
      fetchTasks();
    });

    socket.on('taskUpdated', () => {
      fetchTasks();
    });

    socket.on('taskDeleted', () => {
      fetchTasks();
    });

    // Cleanup on unmount
    return () => {
      socket.off('notification');
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const handleNotificationRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (err) {
      toast.error('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get AI insights
  const getAiInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tasks/insights');
      setAiInsight(response.data);
      toast.success('AI insights updated successfully!');
    } catch (err) {
      toast.error('Failed to get AI insights. Please try again.');
      console.error('Error getting AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    document.body.style.cursor = 'grabbing';
  };

  // Handle drag end
  const handleDragEnd = async (result) => {
    document.body.style.cursor = 'default';

    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Don't do anything if dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Map droppable IDs to task statuses
    const statusMap = {
      'completed': 'completed',
      'pending': 'pending',
      'dueToday': 'pending',
      'overdue': 'pending'
    };

    // Determine the new status based on the destination
    const newStatus = statusMap[destination.droppableId] || 'pending';

    try {
      setLoading(true);
      
      // Optimistically update UI
      const updatedTasks = tasks.map(t => {
        if (t._id === draggableId) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Update in backend
      await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, {
        status: newStatus,
      });
      
      toast.success(`Task moved to ${columns.find(c => c.id === destination.droppableId).title}`);
      
      // Refresh to get latest state
      await fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status. Please try again.');
      console.error('Error updating task status:', err);
      fetchTasks(); // Revert to server state
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (taskData) => {
    try {
      setLoading(true);
      
      if (editingTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/tasks', taskData);
        toast.success('Task created successfully!');
      }
      
      await fetchTasks();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving task:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save task. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (task = null) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  // Filter tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const isToday = dueDate.toDateString() === now.toDateString();
      const isPast = dueDate < now;
      
      switch (status) {
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          return isPast && !isToday && task.status !== 'completed';
        case 'dueToday':
          return isToday && task.status !== 'completed';
        case 'pending':
          // Show in pending if:
          // 1. Status is pending OR
          // 2. Not completed AND not overdue AND not due today
          return (task.status === 'pending' || 
                 (!isPast && !isToday && task.status !== 'completed'));
        default:
          return false;
      }
    });
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      // Optimistically update UI
      const updatedTasks = tasks.map(t => {
        if (t._id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Update in backend
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        status: newStatus,
      });
      
      toast.success(`Task marked as ${newStatus}`);
      
      // Refresh to get latest state
      await fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status. Please try again.');
      console.error('Error updating task status:', err);
      fetchTasks(); // Revert to server state
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'dueToday', title: 'Due Today', color: theme.palette.warning.light },
    { id: 'pending', title: 'Pending', color: theme.palette.info.light },
    { id: 'completed', title: 'Completed', color: theme.palette.success.light },
    { id: 'overdue', title: 'Overdue', color: theme.palette.error.light },
  ];

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: theme.palette.success.light,
                color: theme.palette.success.contrastText,
              },
              icon: '✅',
            },
            error: {
              style: {
                background: theme.palette.error.light,
                color: theme.palette.error.contrastText,
              },
              icon: '❌',
            },
            duration: 3000,
          }}
        />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Task Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon color={notifications.some(n => !n.read) ? "primary" : "inherit"} />}
              onClick={() => setOpenNotificationSettings(true)}
            >
              Notifications {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
            </Button>
            <Button
              variant="outlined"
              startIcon={<InsightIcon />}
              onClick={getAiInsights}
              disabled={loading}
            >
              Get AI Insights
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        {/* AI Insights */}
        <AiInsightPanel insight={aiInsight} />

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Task Columns */}
        <Grid container spacing={3}>
          {columns.map(column => (
            <Grid item xs={12} md={6} lg={3} key={column.id}>
              <TaskColumn
                column={column}
                tasks={getTasksByStatus(column.id)}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>

        {/* Task Form */}
        <TaskForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          initialData={editingTask}
          loading={loading}
        />

        {/* Notification Settings Dialog */}
        <NotificationSettings
          open={openNotificationSettings}
          onClose={() => setOpenNotificationSettings(false)}
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
        />
      </Box>
    </DragDropContext>
  );
} 