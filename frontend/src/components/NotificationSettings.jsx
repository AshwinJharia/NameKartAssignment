import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Slider,
  IconButton,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function NotificationSettings({ open, onClose }) {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    enabled: true,
    highPriority: true,
    mediumPriority: true,
    lowPriority: false,
    reminderHours: 24,
  });
  const [loading, setLoading] = useState(false);

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/notification-settings"
      );
      setSettings(response.data);
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      toast.error("Failed to load notification settings");
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        "http://localhost:5000/api/users/notification-settings",
        settings
      );
      toast.success("Notification settings saved successfully");
      onClose();
    } catch (err) {
      console.error("Error saving notification settings:", err);
      toast.error("Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [name]:
        event.target.checked !== undefined
          ? event.target.checked
          : event.target.value,
    }));
  };

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
          <Typography variant="h6">Notification Settings</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={handleChange("enabled")}
                color="primary"
              />
            }
            label="Enable Notifications"
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Notify me for tasks with priority:
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.highPriority}
                onChange={handleChange("highPriority")}
                color="error"
                disabled={!settings.enabled}
              />
            }
            label="High Priority"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.mediumPriority}
                onChange={handleChange("mediumPriority")}
                color="warning"
                disabled={!settings.enabled}
              />
            }
            label="Medium Priority"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.lowPriority}
                onChange={handleChange("lowPriority")}
                color="info"
                disabled={!settings.enabled}
              />
            }
            label="Low Priority"
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Reminder Time
          </Typography>

          <Box sx={{ px: 2 }}>
            <Slider
              value={settings.reminderHours}
              onChange={handleChange("reminderHours")}
              min={1}
              max={48}
              step={1}
              marks={[
                { value: 1, label: "1h" },
                { value: 24, label: "24h" },
                { value: 48, label: "48h" },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}h before`}
              disabled={!settings.enabled}
            />
          </Box>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
} 