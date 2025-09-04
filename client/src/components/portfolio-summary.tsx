import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Operation } from "@shared/schema";
import { calculateAssetSummary, formatCurrency } from "@/lib/calculations";

interface PortfolioSummaryProps {
  operations: Operation[];
  isLoading: boolean;
}

const ASSET_TYPE_LABELS = {
  acao: "Ação",
  fii: "FII", 
  fundo: "Fundo",
  "renda-fixa": "Renda Fixa",
  cripto: "Cripto"
};

const ASSET_TYPE_COLORS = {
  acao: "bg-blue-100 text-blue-800",
  fii: "bg-green-100 text-green-800",
  fundo: "bg-orange-100 text-orange-800",
  "renda-fixa": "bg-gray-100 text-gray-800",
  cripto: "bg-yellow-100 text-yellow-800"
};

export function PortfolioSummary({ operations, isLoading }: PortfolioSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const assetSummaries = calculateAssetSummary(operations);

  if (assetSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Portfólio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum ativo com posição atual. Registre suas operações para ver o resumo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Portfólio</CardTitle>
        <p className="text-sm text-muted-foreground">
          Posições atuais e médias de preço por ativo
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assetSummaries
            .sort((a, b) => b.totalInvested - a.totalInvested)
            .map((asset) => (
            <div
              key={asset.assetName}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              data-testid={`asset-summary-${asset.assetName.toLowerCase()}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">
                    {asset.assetName}
                  </h3>
                  <Badge className={ASSET_TYPE_COLORS[asset.assetType as keyof typeof ASSET_TYPE_COLORS]}>
                    {ASSET_TYPE_LABELS[asset.assetType as keyof typeof ASSET_TYPE_LABELS]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Quantidade: {asset.totalShares.toLocaleString('pt-BR', { maximumFractionDigits: 6 })}
                  </span>
                  <span>
                    Preço Médio: {formatCurrency(asset.averagePrice)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(asset.totalInvested)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {asset.operations.length} operação{asset.operations.length > 1 ? 'ões' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}