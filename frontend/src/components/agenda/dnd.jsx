import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';

// ============================================================================
// Wrappers finos de Drag & Drop para la agenda (tarea "Reagendar cita · D&D").
// Mantienen ApptCard/SlotCard sin acoplarlos a @dnd-kit.
// El clic sigue funcionando: el PointerSensor del DndContext solo activa el
// arrastre tras mover ≥8px (activationConstraint), así un clic normal no arrastra.
// ============================================================================

/** Hace arrastrable una cita. id = `cita-<id>`, data lleva la cita completa. */
export function DraggableCita({ cita, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `cita-${cita.id}`,
    data: { cita },
  });
  return (
    <Box
      ref={setNodeRef} {...listeners} {...attributes}
      sx={{
        flex: 1, minWidth: 0, touchAction: 'none',
        opacity: isDragging ? 0.4 : 1, cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </Box>
  );
}

/** Zona donde soltar una cita (un slot libre). id = `slot-<hora>`. */
export function DroppableSlot({ hora, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${hora}`,
    data: { hora },
  });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1, borderRadius: 3,
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        transition: 'outline .1s',
      }}
    >
      {children}
    </Box>
  );
}
