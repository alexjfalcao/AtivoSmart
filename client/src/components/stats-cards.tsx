import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightLeft, Coins, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Operation } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculatePortfolioSummary, formatCurrency } from "@/lib/calculations";

interface StatsCardsProps {
  operations: Operation[];
  isLoading: boolean;
}

export function StatsCards({ operations, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const portfolioSummary = calculatePortfolioSummary(operations);
  const lastOperationDate = operations.length > 0 
    ? format(new Date(operations[0].createdAt), "dd/MM/yyyy", { locale: ptBR })
    : "Nenhuma";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Investido</p>
              <p className="text-2xl font-semibold text-foreground" data-testid="text-total-invested">
                {formatCurrency(portfolioSummary.totalInvested)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total de Operações</p>
              <p className="text-2xl font-semibold text-foreground" data-testid="text-total-operations">
                {portfolioSummary.totalOperations}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Ativos Únicos</p>
              <p className="text-2xl font-semibold text-foreground" data-testid="text-unique-assets">
                {portfolioSummary.totalAssets}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Última Operação</p>
              <p className="text-2xl font-semibold text-foreground" data-testid="text-last-operation">
                {lastOperationDate}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
