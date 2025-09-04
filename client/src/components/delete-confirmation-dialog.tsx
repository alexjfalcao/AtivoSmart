import { useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";
import type { Operation } from "@shared/schema";

interface DeleteConfirmationDialogProps {
  operation: Operation | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({ operation, onSuccess, onCancel }: DeleteConfirmationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: "Sucesso",
        description: "Operação excluída com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir operação",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = () => {
    if (operation) {
      deleteMutation.mutate(operation.id);
    }
  };

  return (
    <Dialog open={!!operation} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta operação? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        {operation && (
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Operação a ser excluída:</p>
              <p className="font-medium">
                {operation.assetName.toUpperCase()} - {operation.operationType.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Quantidade: {parseFloat(operation.quantity).toLocaleString('pt-BR')} | 
                Preço: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(operation.unitPrice))}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline"
            onClick={onCancel}
            disabled={deleteMutation.isPending}
            data-testid="button-cancel-delete"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
