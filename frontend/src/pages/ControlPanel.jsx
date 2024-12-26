import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormGroup,
  FormControlLabel,
  Slider,
  Divider,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ControlPanel() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    enabled: true,
    priorityLevels: {
      low: false,
      medium: true,
      high: true,
    },
    timing: {
      beforeDeadline: 2,
      dailyDigest: true,
      overdueReminders: true,
    },
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/settings');
      if (response.data.notificationPreferences) {
        setSettings(response.data.notificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load notification settings');
    }
  };

  const handleChange = async (section, field, value) => {
    const newSettings = { ...settings };
    if (section) {
      newSettings[section][field] = value;
    } else {
      newSettings[field] = value;
    }
    setSettings(newSettings);

    try {
      await axios.patch('http://localhost:5000/api/users/settings', {
        notificationPreferences: newSettings,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Control Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => handleChange(null, 'enabled', e.target.checked)}
              />
            }
            label="Enable Notifications"
          />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          Priority Levels
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.priorityLevels.high}
                onChange={(e) =>
                  handleChange('priorityLevels', 'high', e.target.checked)
                }
              />
            }
            label="High Priority Tasks"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.priorityLevels.medium}
                onChange={(e) =>
                  handleChange('priorityLevels', 'medium', e.target.checked)
                }
              />
            }
            label="Medium Priority Tasks"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.priorityLevels.low}
                onChange={(e) =>
                  handleChange('priorityLevels', 'low', e.target.checked)
                }
              />
            }
            label="Low Priority Tasks"
          />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          Timing Preferences
        </Typography>
        <Box sx={{ px: 2, mt: 2, mb: 4 }}>
          <Typography gutterBottom>
            Notify before deadline (hours): {settings.timing.beforeDeadline}
          </Typography>
          <Slider
            value={settings.timing.beforeDeadline}
            min={1}
            max={24}
            step={1}
            marks={[
              { value: 1, label: '1h' },
              { value: 12, label: '12h' },
              { value: 24, label: '24h' },
            ]}
            onChange={(_, value) =>
              handleChange('timing', 'beforeDeadline', value)
            }
          />
        </Box>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.timing.dailyDigest}
                onChange={(e) =>
                  handleChange('timing', 'dailyDigest', e.target.checked)
                }
              />
            }
            label="Daily Task Digest"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.timing.overdueReminders}
                onChange={(e) =>
                  handleChange('timing', 'overdueReminders', e.target.checked)
                }
              />
            }
            label="Overdue Task Reminders"
          />
        </FormGroup>
      </Paper>
    </Box>
  );
} 