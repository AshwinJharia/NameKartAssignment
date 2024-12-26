import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Badge,
  useTheme,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from "../config/api";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceDate = result.source.droppableId;
    const destinationDate = result.destination.droppableId;
    const taskId = result.draggableId;

    try {
      await api.put(`/api/tasks/${taskId}`, {
        dueDate: new Date(destinationDate),
      });

      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = startOfMonth(currentDate);

    // Add empty cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <Grid item xs={1.7} key={`empty-${i}`}>
          <Box sx={{ aspectRatio: "1/1" }} />
        </Grid>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateString = formatDateString(date);
      const dayTasks = getTasksForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isExpanded = expandedDay === dateString;

      days.push(
        <Grid item xs={1.7} key={day}>
          <Card
            sx={{
              height: "100%",
              minHeight: isExpanded ? "200px" : "auto",
              aspectRatio: isExpanded ? "auto" : "1/1",
              bgcolor: isToday
                ? theme.palette.primary.light
                : "background.paper",
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setExpandedDay(isExpanded ? null : dateString)}
          >
            <CardContent sx={{ p: 1, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? "bold" : "normal",
                    }}
                  >
                    {day}
                  </Typography>
                  <Badge badgeContent={dayTasks.length} color="primary" />
                </Box>

                <Droppable droppableId={dateString}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        mt: 1,
                        flexGrow: 1,
                        minHeight: "50px",
                        backgroundColor: snapshot.isDraggingOver
                          ? theme.palette.action.hover
                          : "transparent",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <Collapse in={isExpanded || dayTasks.length <= 2}>
                        {dayTasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 0.5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  p: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: snapshot.isDragging
                                    ? theme.palette.background.paper
                                    : "transparent",
                                  boxShadow: snapshot.isDragging
                                    ? theme.shadows[2]
                                    : "none",
                                }}
                              >
                                <DragIndicatorIcon
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: "text.secondary",
                                  }}
                                />
                                <Tooltip title={task.title}>
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{
                                      color: {
                                        low: theme.palette.success.main,
                                        medium: theme.palette.warning.main,
                                        high: theme.palette.error.main,
                                      }[task.priority],
                                      fontSize: "0.7rem",
                                      flexGrow: 1,
                                    }}
                                  >
                                    {task.title}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                      </Collapse>
                      {!isExpanded && dayTasks.length > 2 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.7rem",
                            display: "block",
                            textAlign: "center",
                          }}
                        >
                          +{dayTasks.length - 2} more
                        </Typography>
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      );
    }

    return days;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Calendar View
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Day names header */}
            {dayNames.map((day) => (
              <Grid item xs={1.7} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}

            {/* Calendar days */}
            {renderCalendarDays()}
          </Grid>
        </Paper>
      </DragDropContext>
    </Box>
  );
} 