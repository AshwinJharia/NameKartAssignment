import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Divider,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Circle as CircleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

export default function NotificationSettings({ open, onClose, notifications = [], onNotificationRead }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon />
            <Typography variant="h6">
              Notifications
              {notifications.filter(n => !n.read).length > 0 && 
                ` (${notifications.filter(n => !n.read).length} unread)`
              }
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {notifications.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            py: 4 
          }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
                {index > 0 && <Divider />}
                <ListItem
                  onClick={() => !notification.read && onNotificationRead(notification._id)}
                  sx={{
                    cursor: !notification.read ? 'pointer' : 'default',
                    bgcolor: !notification.read ? 'action.hover' : 'transparent',
                    '&:hover': {
                      bgcolor: !notification.read ? 'action.selected' : 'transparent',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Badge color="primary" variant="dot" invisible={notification.read}>
                      <NotificationsIcon color={notification.read ? "disabled" : "primary"} />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.createdAt).toLocaleString()}
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        color: notification.read ? 'text.secondary' : 'text.primary',
                      }
                    }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
} 