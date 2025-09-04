import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Operation } from "@shared/schema";
import { calculatePortfolioSummary, formatCurrency } from "@/lib/calculations";

interface EvolutionChartProps {
  operations: Operation[];
  isLoading: boolean;
}

export function EvolutionChart({ operations, isLoading }: EvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  const portfolioSummary = calculatePortfolioSummary(operations);

  if (portfolioSummary.monthlyEvolution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Patrimonial</CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolução do valor investido ao longo do tempo
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Dados insuficientes para gerar o gráfico. Registre mais operações.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = portfolioSummary.monthlyEvolution.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    }),
    totalInvestido: item.totalInvested,
    totalPatrimonio: item.totalPatrimony,
    rendimentosAcumulados: item.accumulatedIncome,
    operacoes: item.operationsCount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`Mês: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
          <p className="text-sm text-muted-foreground mt-1">
            {`Operações: ${payload[0].payload.operacoes}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Patrimonial</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolução do total investido, patrimônio atual e rendimentos acumulados
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full" data-testid="evolution-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').slice(0, -3) + 'k'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalInvestido" 
                name="Total Investido"
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#22c55e", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalPatrimonio" 
                name="Total Patrimônio"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="rendimentosAcumulados" 
                name="Rendimentos Acumulados"
                stroke="#a855f7" 
                strokeWidth={2}
                dot={{ fill: "#a855f7", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#a855f7", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}