import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Header } from '../../components';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/apiService';
import { tokens } from '../../theme';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

const Loans = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const { data } = await api.get('/loans');
        setLoans(data);
      } catch (error) {
        console.error('Error al obtener préstamos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const goToLoan = (id) => navigate(`/loan/${id}`);

  const handleConfirmDelete = async () => {
    if (!selectedLoan) return;
console.log(selectedLoan.loan_id);
    setIsDeleting(true);
    try {
      await api.delete(`/loan/${selectedLoan.loan_id}`);
      setLoans((prev) => prev.filter((loan) => loan.loan_id !== selectedLoan.loan_id));
    } catch (error) {
      console.error('Error al eliminar el préstamo:', error);
    } finally {
      setIsDeleting(false);
      setOpenDialog(false);
      setSelectedLoan(null);
    }
  };

  const confirmDelete = (loan) => {
    setSelectedLoan(loan);
    setOpenDialog(true);
  };

  const columns = [
    { field: 'loan_id', headerName: 'ID', flex: 1 },
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 1,
      valueGetter: (params) =>
        `${params.row.user.first_name} ${params.row.user.last_name}`,
    },
    {
      field: 'material',
      headerName: 'Material',
      flex: 1,
      valueGetter: (params) =>
        `${params.row.material.material_type} - ${params.row.material.brand} ${params.row.material.model}`,
    },
    { field: 'loan_date', headerName: 'Fecha de Préstamo', flex: 1 },
    { field: 'return_date', headerName: 'Fecha de Devolución', flex: 1 },
    {
      field: 'loan_status',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === 'Active' ? colors.greenAccent[500] : colors.redAccent[500],
            color: colors.gray[100],
            padding: '5px 10px',
            borderRadius: '4px',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => (
        <Box
          display="flex"
          gap="10px"
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => goToLoan(params.row.loan_id)}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => confirmDelete(params.row)}
          >
            Eliminar
          </Button>
        </Box>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <Box m="20px">
      <Header
        title="Préstamos"
        subtitle="Gestión de préstamos"
      />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: colors.orange[500] },
          '& .MuiDataGrid-virtualScroller': { backgroundColor: colors.primary[400] },
          '& .MuiDataGrid-footerContainer': { backgroundColor: colors.orange[500] },
        }}
      >
        <DataGrid
          rows={loans}
          columns={columns}
          getRowId={(row) => row.loan_id}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar el préstamo de {' '}
            <strong>
              {selectedLoan?.user?.first_name} {selectedLoan?.user?.last_name}
            </strong>
            del material {' '}
            <strong>
              {selectedLoan?.material?.material_type} - {selectedLoan?.material?.brand}{' '}
              {selectedLoan?.material?.model}
            </strong>
            ? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Loans;
