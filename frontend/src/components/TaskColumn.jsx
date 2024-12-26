import { Box, Typography, Paper } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

export default function TaskColumn({ column, tasks, onEdit, onDelete, onStatusChange }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        bgcolor: column.color,
        borderRadius: 2,
        p: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 1,
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {column.title} <span>({tasks.length})</span>
      </Typography>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 200,
              height: '100%',
              transition: 'all 0.2s ease',
              bgcolor: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
              borderRadius: 1,
              border: snapshot.isDraggingOver ? '2px dashed rgba(0, 0, 0, 0.2)' : '2px solid transparent',
              padding: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {tasks.map((task, index) => (
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
                      transform: snapshot.isDragging ? 'rotate(3deg) scale(1.02)' : 'none',
                      transition: 'all 0.2s ease',
                      opacity: snapshot.isDragging ? 0.9 : 1,
                      '& > *': {
                        boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
                      },
                    }}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => onEdit(task)}
                      onDelete={() => onDelete(task._id)}
                      onStatusChange={onStatusChange}
                    />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
} 