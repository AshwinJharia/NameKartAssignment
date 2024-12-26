import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export default function NotificationList({
  open = false,
  onClose = () => {},
  notifications = [],
  onNotificationRead = () => {},
}) {
  const theme = useTheme();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "error":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {safeNotifications.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
            No notifications
          </Typography>
        ) : (
          <List>
            {safeNotifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  bgcolor: notification.read ? "transparent" : "action.hover",
                  borderLeft: `4px solid ${
                    notification.type === "success"
                      ? theme.palette.success.main
                      : notification.type === "error"
                      ? theme.palette.error.main
                      : notification.type === "warning"
                      ? theme.palette.warning.main
                      : theme.palette.info.main
                  }`,
                  mb: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                }}
                onClick={() =>
                  !notification.read && onNotificationRead(notification._id)
                }
              >
                <Box sx={{ mr: 2 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                  primaryTypographyProps={{
                    color: notification.read ? "textSecondary" : "textPrimary",
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
