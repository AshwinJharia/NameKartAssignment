import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

export default function TaskForm({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description || "",
          priority: initialData.priority,
          dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          dueDate: null,
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: newDate,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              name="title"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              inputProps={{
                maxLength: 100,
              }}
            />

            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              inputProps={{
                maxLength: 500,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                required
                disabled={loading}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  disabled: loading,
                },
              }}
              minDateTime={new Date()}
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.title || !formData.dueDate || loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {initialData ? "Updating..." : "Adding..."}
              </>
            ) : initialData ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
