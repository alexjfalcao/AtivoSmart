import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { operationsApi } from "@/lib/api";
import { StatsCards } from "@/components/stats-cards";
import { OperationsTable } from "@/components/operations-table";
import { OperationForm } from "@/components/operation-form";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { EvolutionChart } from "@/components/evolution-chart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ChartLine, Bell, UserCircle } from "lucide-react";
import type { Operation } from "@shared/schema";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [deleteOperation, setDeleteOperation] = useState<Operation | null>(null);

  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/operations"],
    queryFn: operationsApi.getAll,
  });

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    setIsFormOpen(true);
  };

  const handleDelete = (operation: Operation) => {
    setDeleteOperation(operation);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingOperation(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeleteOperation(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartLine className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Portfolio Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Registro de Operações</h2>
            <p className="text-muted-foreground">Controle manual das suas operações de investimento</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="mt-4 sm:mt-0"
            data-testid="button-new-operation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Operação
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards operations={operations} isLoading={isLoading} />

        {/* Portfolio Summary and Evolution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PortfolioSummary operations={operations} isLoading={isLoading} />
          <EvolutionChart operations={operations} isLoading={isLoading} />
        </div>

        {/* Operations Table */}
        <OperationsTable 
          operations={operations}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Operation Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOperation ? "Editar Operação" : "Nova Operação"}
            </DialogTitle>
          </DialogHeader>
          <OperationForm
            operation={editingOperation}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        operation={deleteOperation}
        onSuccess={handleDeleteSuccess}
        onCancel={() => setDeleteOperation(null)}
      />
    </div>
  );
}
