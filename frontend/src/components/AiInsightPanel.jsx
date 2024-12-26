import { Paper, Box, Typography } from '@mui/material';
import { Lightbulb as LightbulbIcon } from '@mui/icons-material';

export default function AiInsightPanel({ insight }) {
  if (!insight) return null;

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LightbulbIcon color="primary" />
        <Typography variant="subtitle1" color="primary.dark">
          AI Insight
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {insight}
      </Typography>
    </Paper>
  );
} 