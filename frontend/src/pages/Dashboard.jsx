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
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { DragDropContext } from "react-beautiful-dnd";
import toast, { Toaster } from "react-hot-toast";
import io from "socket.io-client";

import TaskColumn from "../components/TaskColumn";
import TaskForm from "../components/TaskForm";
import AiInsightPanel from "../components/AiInsightPanel";
import NotificationSettings from "../components/NotificationSettings";
import NotificationList from "../components/NotificationList";
import api, { VITE_API_URL } from "../config/api";

export default function Dashboard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [openNotificationSettings, setOpenNotificationSettings] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openNotificationList, setOpenNotificationList] = useState(false);
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(VITE_API_URL, {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      toast.success("Connected to notification server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Failed to connect to notification server. Retrying...");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        newSocket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message, {
        icon: "🔔",
      });
    });

    socket.on("taskCreated", fetchTasks);
    socket.on("taskUpdated", fetchTasks);
    socket.on("taskDeleted", fetchTasks);

    return () => {
      socket.off("notification");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [socket]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/api/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const handleNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/tasks");
      setTasks(response.data);
    } catch (err) {
      toast.error("Failed to fetch tasks. Please try again.");
      console.error("Error fetching tasks:", err);
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
      const response = await api.get("/api/tasks/insights");
      setAiInsight(response.data);
      toast.success("AI insights updated successfully!");
    } catch (err) {
      toast.error("Failed to get AI insights. Please try again.");
      console.error("Error getting AI insights:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    document.body.style.cursor = "grabbing";
  };

  // Handle drag end
  const handleDragEnd = async (result) => {
    document.body.style.cursor = "default";

    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const statusMap = {
      completed: "completed",
      pending: "pending",
      dueToday: "pending",
      overdue: "pending",
    };

    const newStatus = statusMap[destination.droppableId] || "pending";

    try {
      setLoading(true);
      const updatedTasks = tasks.map((t) => {
        if (t._id === draggableId) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      setTasks(updatedTasks);

      await api.patch(`/api/tasks/${draggableId}/status`, {
        status: newStatus,
      });

      toast.success(
        `Task moved to ${
          columns.find((c) => c.id === destination.droppableId).title
        }`
      );
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to update task status. Please try again.");
      console.error("Error updating task status:", err);
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (taskData) => {
    try {
      setLoading(true);
      if (editingTask) {
        // Update existing task
        await api.put(`/api/tasks/${editingTask._id}`, {
          ...taskData,
          status: editingTask.status, // Preserve the current status
        });
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        await api.post("/api/tasks", {
          ...taskData,
          status: "pending", // Default status for new tasks
        });
        toast.success("Task created successfully!");
      }
      await fetchTasks(); // Refresh the task list
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error(
        err.response?.data?.message || "Failed to save task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      await api.delete(`/api/tasks/${taskId}`);
      toast.success("Task deleted successfully!");
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
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

  // Get tasks by status
  const getTasksByStatus = useCallback(
    (status) => {
      const now = new Date();
      return tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);

        switch (status) {
          case "completed":
            return task.status === "completed";

          case "overdue":
            return task.status !== "completed" && dueDate < now;

          case "dueToday":
            return (
              task.status !== "completed" &&
              dueDate >= now &&
              dueDate.toDateString() === now.toDateString()
            );

          case "pending":
            return (
              task.status === "pending" &&
              dueDate >= now &&
              dueDate.toDateString() !== now.toDateString()
            );

          default:
            return false;
        }
      });
    },
    [tasks]
  );

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const updatedTasks = tasks.map((t) => {
        if (t._id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      setTasks(updatedTasks);

      await api.patch(`/api/tasks/${taskId}/status`, {
        status: newStatus,
      });

      toast.success(`Task marked as ${newStatus}`);
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to update task status. Please try again.");
      console.error("Error updating task status:", err);
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: "dueToday", title: "Due Today", color: theme.palette.warning.light },
    { id: "pending", title: "Pending", color: theme.palette.info.light },
    { id: "completed", title: "Completed", color: theme.palette.success.light },
    { id: "overdue", title: "Overdue", color: theme.palette.error.light },
  ];

  // Fetch notification settings on mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await api.get("/api/users/notification-settings");
        setSettings(response.data);
      } catch (err) {
        console.error("Error fetching notification settings:", err);
        toast.error("Failed to load notification settings");
      }
    };

    fetchNotificationSettings();
  }, []);

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
              icon: "✅",
            },
            error: {
              style: {
                background: theme.palette.error.light,
                color: theme.palette.error.contrastText,
              },
              icon: "❌",
            },
            duration: 3000,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Task Dashboard
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenNotificationSettings(true)}
              startIcon={<SettingsIcon />}
            >
              Notification Settings
            </Button>
            <Button
              variant="outlined"
              color={notifications.some((n) => !n.read) ? "primary" : "inherit"}
              startIcon={
                <NotificationsIcon
                  color={
                    notifications.some((n) => !n.read) ? "primary" : "inherit"
                  }
                />
              }
              onClick={() => setOpenNotificationList(true)}
            >
              Notifications{" "}
              {notifications.filter((n) => !n.read).length > 0 &&
                `(${notifications.filter((n) => !n.read).length})`}
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
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Task Columns */}
        <Grid container spacing={3}>
          {columns.map((column) => (
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

        {/* Notification List Dialog */}
        <NotificationList
          open={openNotificationList}
          onClose={() => setOpenNotificationList(false)}
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
        />

        {/* Notification Settings Dialog */}
        <NotificationSettings
          open={openNotificationSettings}
          onClose={() => setOpenNotificationSettings(false)}
        />
      </Box>
    </DragDropContext>
  );
} 