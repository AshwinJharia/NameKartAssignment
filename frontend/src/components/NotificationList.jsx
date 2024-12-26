import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Menu,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import io from 'socket.io-client';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      newSocket.emit('authenticate', token);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show snackbar notification
      setSnackbar({
        open: true,
        message: notification.message
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Task Reminder', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch existing notifications
    fetchNotifications();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(
          `http://localhost:5000/api/users/notifications/${notification._id}`,
          { read: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(prev => prev - 1);
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        socket?.emit('notificationRead', notification._id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <IconButton 
        onClick={handleMenuOpen} 
        sx={{ 
          color: 'text.primary',
          '&:hover': {
            color: 'primary.main',
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: 'error.main',
              color: 'white',
            }
          }}
        >
          <NotificationsIcon sx={{ 
            color: 'inherit',
            fontSize: '1.5rem'
          }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary" align="center">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  borderLeft: notification.type === 'overdue' ? '4px solid' : 'none',
                  borderColor: 'error.main',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      component="div"
                      color={notification.type === 'overdue' ? 'error' : 'inherit'}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                      {notification.type === 'overdue' && notification.tasks && (
                        <Box sx={{ mt: 1 }}>
                          {notification.tasks.map(task => (
                            <Typography
                              key={task._id}
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 2, '&:before': { content: '"•"', mr: 1 } }}
                            >
                              {task.title}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </>
                  }
                />
                {!notification.read && (
                  <CircleIcon
                    sx={{
                      fontSize: 12,
                      color: notification.type === 'overdue' ? 'error.main' : 'primary.main',
                      ml: 1,
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.type === 'overdue' ? 'error' : 'info'} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 