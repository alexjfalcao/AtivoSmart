import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsApi } from "@/lib/api";
import { insertOperationSchema, type InsertOperation, type Operation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

interface OperationFormProps {
  operation?: Operation | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OperationForm({ operation, onSuccess, onCancel }: OperationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<InsertOperation>({
    resolver: zodResolver(insertOperationSchema),
    defaultValues: {
      assetName: "",
      assetType: "acao",
      operationType: "compra",
      operationDate: "",
      quantity: 0,
      unitPrice: 0,
      fees: 0,
      brokerage: "",
      notes: "",
    },
  });

  const { watch, setValue } = form;
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");
  const fees = watch("fees");

  // Calculate total amount when values change
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const totalFees = Number(fees) || 0;
    const total = (qty * price) + totalFees;
    setTotalAmount(total);
  }, [quantity, unitPrice, fees]);

  // Load operation data for editing
  useEffect(() => {
    if (operation) {
      setValue("assetName", operation.assetName);
      setValue("assetType", operation.assetType as any);
      setValue("operationType", operation.operationType as any);
      setValue("operationDate", operation.operationDate);
      setValue("quantity", Number(operation.quantity));
      setValue("unitPrice", Number(operation.unitPrice));
      setValue("fees", Number(operation.fees || 0));
      setValue("brokerage", operation.brokerage || "");
      setValue("notes", operation.notes || "");
    }
  }, [operation, setValue]);

  const createMutation = useMutation({
    mutationFn: operationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: "Sucesso",
        description: "Operação criada com sucesso!",
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
        description: error.message || "Falha ao criar operação",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertOperation) => operationsApi.update(operation!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: "Sucesso", 
        description: "Operação atualizada com sucesso!",
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
        description: error.message || "Falha ao atualizar operação",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOperation) => {
    if (operation) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do ativo *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: PETR4, ITUB4, HGLG11"
                    {...field}
                    data-testid="input-asset-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assetType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de ativo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-asset-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="acao">Ações</SelectItem>
                    <SelectItem value="fii">FIIs</SelectItem>
                    <SelectItem value="fundo">Fundos</SelectItem>
                    <SelectItem value="renda-fixa">Renda Fixa</SelectItem>
                    <SelectItem value="cripto">Criptomoedas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="operationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de operação *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-operation-type">
                      <SelectValue placeholder="Selecione a operação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="rendimento">Rendimento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da operação *</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    data-testid="input-operation-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço unitário (R$) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-unit-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxas e impostos (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-fees"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brokerage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corretora</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: XP, Rico, Clear"
                    {...field}
                    data-testid="input-brokerage"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-muted/30">
            <CardContent className="flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total da operação</p>
                <p className="text-lg font-semibold text-foreground" data-testid="text-total-amount">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre a operação..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {operation ? "Atualizar Operação" : "Salvar Operação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
