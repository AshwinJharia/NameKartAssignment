import { Chip, useTheme } from '@mui/material';

export default function TaskStatus({ status, dueDate }) {
  const theme = useTheme();
  const now = new Date();
  const due = new Date(dueDate);

  if (status === 'completed') {
    return (
      <Chip
        label="Completed"
        size="small"
        color="success"
        sx={{ fontWeight: 500 }}
      />
    );
  }

  if (due < now) {
    return (
      <Chip
        label="Overdue"
        size="small"
        color="error"
        sx={{ fontWeight: 500 }}
      />
    );
  }

  if (due.toDateString() === now.toDateString()) {
    return (
      <Chip
        label="Due Today"
        size="small"
        color="warning"
        sx={{ fontWeight: 500 }}
      />
    );
  }

  return (
    <Chip
      label="Pending"
      size="small"
      color="info"
      sx={{ fontWeight: 500 }}
    />
  );
} 