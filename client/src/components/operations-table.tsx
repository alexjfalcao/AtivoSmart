import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Operation } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OperationsTableProps {
  operations: Operation[];
  isLoading: boolean;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
}

const ASSET_TYPE_LABELS = {
  acao: "Ação",
  fii: "FII", 
  fundo: "Fundo",
  "renda-fixa": "Renda Fixa",
  cripto: "Cripto"
};

const OPERATION_TYPE_LABELS = {
  compra: "Compra",
  venda: "Venda", 
  rendimento: "Rendimento"
};

const OPERATION_TYPE_COLORS = {
  compra: "bg-green-100 text-green-800",
  venda: "bg-red-100 text-red-800",
  rendimento: "bg-purple-100 text-purple-800"
};

const ASSET_TYPE_COLORS = {
  acao: "bg-blue-100 text-blue-800",
  fii: "bg-green-100 text-green-800",
  fundo: "bg-orange-100 text-orange-800",
  "renda-fixa": "bg-gray-100 text-gray-800",
  cripto: "bg-yellow-100 text-yellow-800"
};

export function OperationsTable({ operations, isLoading, onEdit, onDelete }: OperationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !assetTypeFilter || assetTypeFilter === "all" || operation.assetType === assetTypeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOperations = filteredOperations.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const calculateTotal = (quantity: string, unitPrice: string, fees: string) => {
    const total = (parseFloat(quantity) * parseFloat(unitPrice)) + parseFloat(fees || "0");
    return formatCurrency(total);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-foreground">Operações Registradas</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ativo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-asset"
              />
            </div>
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger className="w-32" data-testid="select-asset-type-filter">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="acao">Ações</SelectItem>
                <SelectItem value="fii">FIIs</SelectItem>
                <SelectItem value="fundo">Fundos</SelectItem>
                <SelectItem value="renda-fixa">Renda Fixa</SelectItem>
                <SelectItem value="cripto">Criptomoedas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {paginatedOperations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-operations">
              {operations.length === 0 
                ? "Nenhuma operação registrada ainda. Clique em 'Nova Operação' para começar."
                : "Nenhuma operação encontrada com os filtros aplicados."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ativo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Operação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Corretora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {paginatedOperations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-foreground" data-testid={`text-asset-name-${operation.id}`}>
                          {operation.assetName.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={ASSET_TYPE_COLORS[operation.assetType as keyof typeof ASSET_TYPE_COLORS]}>
                          {ASSET_TYPE_LABELS[operation.assetType as keyof typeof ASSET_TYPE_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={OPERATION_TYPE_COLORS[operation.operationType as keyof typeof OPERATION_TYPE_COLORS]}>
                          {OPERATION_TYPE_LABELS[operation.operationType as keyof typeof OPERATION_TYPE_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(operation.operationDate), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">
                        {parseFloat(operation.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 6 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">
                        {formatCurrency(operation.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {operation.brokerage || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                        {calculateTotal(operation.quantity, operation.unitPrice, operation.fees || "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(operation)}
                          className="text-primary hover:text-primary/80 mr-2"
                          data-testid={`button-edit-${operation.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(operation)}
                          className="text-destructive hover:text-destructive/80"
                          data-testid={`button-delete-${operation.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium">{startIndex + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredOperations.length)}</span> de{" "}
                  <span className="font-medium">{filteredOperations.length}</span> operações
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
