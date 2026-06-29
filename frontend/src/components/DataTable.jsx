import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { palette } from '../theme';

// Textos en espanol para el DataGrid (toolbar, paginacion, filtros, vacio).
const textosES = {
  noRowsLabel: 'Sin registros',
  noResultsOverlayLabel: 'No se encontraron resultados.',
  toolbarColumns: 'Columnas',
  toolbarFilters: 'Filtros',
  toolbarDensity: 'Densidad',
  toolbarExport: 'Exportar',
  toolbarQuickFilterPlaceholder: 'Buscar...',
  columnMenuSortAsc: 'Orden ascendente',
  columnMenuSortDesc: 'Orden descendente',
  columnMenuFilter: 'Filtrar',
  columnMenuHideColumn: 'Ocultar columna',
  columnMenuManageColumns: 'Gestionar columnas',
  footerRowSelected: (n) => `${n} fila(s) seleccionada(s)`,
  filterPanelInputLabel: 'Valor',
  filterPanelOperator: 'Operador',
  filterOperatorContains: 'contiene',
  filterOperatorEquals: 'es igual a',
  filterOperatorStartsWith: 'empieza con',
  MuiTablePagination: {
    labelRowsPerPage: 'Filas por pagina:',
    labelDisplayedRows: ({ from, to, count }) => `${from}–${to} de ${count}`,
  },
};

/**
 * Tabla reutilizable basada en MUI X DataGrid: orden, filtro y paginacion
 * integrados, en espanol y con el estilo de CareOne (sin cambiar la paleta).
 *
 * Props: rows, columns, loading, onRowClick, pageSize (default 10).
 */
export default function DataTable({ rows, columns, loading, onRowClick, pageSize = 10, ...rest }) {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows || []}
        columns={columns}
        loading={loading}
        localeText={textosES}
        onRowClick={onRowClick}
        initialState={{ pagination: { paginationModel: { pageSize } } }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: `1px solid ${palette.border}`,
          borderRadius: 3,
          bgcolor: palette.white,
          fontFamily: "'Inter', sans-serif",
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#F9FAFB' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12, color: palette.text3, textTransform: 'uppercase', letterSpacing: '0.4px' },
          '& .MuiDataGrid-cell': { fontSize: 13.5 },
          '& .MuiDataGrid-row:hover': { bgcolor: '#FAFAFA' },
          '& .MuiDataGrid-row': onRowClick ? { cursor: 'pointer' } : {},
          '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${palette.divider}` },
        }}
        {...rest}
      />
    </Box>
  );
}
