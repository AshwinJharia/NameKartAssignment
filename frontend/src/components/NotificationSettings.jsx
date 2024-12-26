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
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function NotificationSettings({ open, onClose }) {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    enabled: true,
    priorities: ["high", "medium"],
    reminderTime: 2,
  });
  const [loading, setLoading] = useState(false);

  // Fetch current settings when dialog opens
  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const response = await api.get("/api/users/notification-settings");
      const data = response.data;
      setSettings({
        enabled: data.enabled,
        priorities: data.priorities || ["high", "medium"],
        reminderTime: data.reminderTime || 2,
      });
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      toast.error("Failed to load notification settings");
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put("/api/users/notification-settings", settings);
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
    if (name === "enabled") {
      setSettings((prev) => ({ ...prev, enabled: event.target.checked }));
    } else if (name === "reminderTime") {
      setSettings((prev) => ({ ...prev, reminderTime: event.target.value }));
    }
  };

  const handlePriorityChange = (priority) => (event) => {
    setSettings((prev) => ({
      ...prev,
      priorities: event.target.checked
        ? [...prev.priorities, priority]
        : prev.priorities.filter((p) => p !== priority),
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
                checked={settings.priorities.includes("high")}
                onChange={handlePriorityChange("high")}
                color="error"
                disabled={!settings.enabled}
              />
            }
            label="High Priority"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.priorities.includes("medium")}
                onChange={handlePriorityChange("medium")}
                color="warning"
                disabled={!settings.enabled}
              />
            }
            label="Medium Priority"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.priorities.includes("low")}
                onChange={handlePriorityChange("low")}
                color="info"
                disabled={!settings.enabled}
              />
            }
            label="Low Priority"
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Reminder Time (hours before due date)
          </Typography>

          <Box sx={{ px: 2 }}>
            <Slider
              value={settings.reminderTime}
              onChange={handleChange("reminderTime")}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 