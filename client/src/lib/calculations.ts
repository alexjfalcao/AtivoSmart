import type { Operation } from "@shared/schema";

export interface AssetSummary {
  assetName: string;
  assetType: string;
  totalShares: number;
  totalInvested: number;
  averagePrice: number;
  lastOperation: string;
  operations: Operation[];
}

export interface PortfolioSummary {
  totalInvested: number;
  totalAssets: number;
  totalOperations: number;
  assetsByType: Record<string, number>;
  monthlyEvolution: Array<{
    month: string;
    totalInvested: number;
    totalPatrimony: number;
    accumulatedIncome: number;
    operationsCount: number;
  }>;
}

export function calculateAssetSummary(operations: Operation[]): AssetSummary[] {
  const assetGroups = operations.reduce((acc, operation) => {
    const key = operation.assetName.toUpperCase();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(operation);
    return acc;
  }, {} as Record<string, Operation[]>);

  return Object.entries(assetGroups).map(([assetName, assetOperations]) => {
    let totalShares = 0;
    let totalInvested = 0;
    let totalValue = 0; // For average price calculation

    assetOperations.forEach(op => {
      const quantity = parseFloat(op.quantity);
      const price = parseFloat(op.unitPrice);
      const fees = parseFloat(op.fees || "0");
      const operationValue = quantity * price + fees;

      if (op.operationType === "compra") {
        totalShares += quantity;
        totalInvested += operationValue;
        totalValue += operationValue;
      } else if (op.operationType === "venda") {
        totalShares -= quantity;
        const saleValue = quantity * price - fees; // Subtract fees from sale
        totalInvested -= (totalInvested / totalShares) * quantity; // Reduce proportionally
        totalValue -= saleValue;
      } else if (op.operationType === "rendimento") {
        // Rendimento doesn't change shares but adds to total return
        totalInvested -= operationValue; // Subtract income from cost basis
      }
    });

    const averagePrice = totalShares > 0 ? totalValue / totalShares : 0;
    const lastOperation = assetOperations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      .operationDate;

    return {
      assetName,
      assetType: assetOperations[0].assetType,
      totalShares: Math.max(0, totalShares), // Ensure non-negative
      totalInvested: Math.max(0, totalInvested), // Ensure non-negative
      averagePrice,
      lastOperation,
      operations: assetOperations,
    };
  }).filter(asset => asset.totalShares > 0); // Only show assets with current positions
}

export function calculatePortfolioSummary(operations: Operation[]): PortfolioSummary {
  const totalInvested = operations.reduce((sum, op) => {
    const quantity = parseFloat(op.quantity);
    const price = parseFloat(op.unitPrice);
    const fees = parseFloat(op.fees || "0");
    const operationValue = quantity * price + fees;

    if (op.operationType === "compra") {
      return sum + operationValue;
    } else if (op.operationType === "venda") {
      return sum - operationValue;
    }
    // Rendimentos don't add to invested amount
    return sum;
  }, 0);

  const assetsByType = operations.reduce((acc, op) => {
    if (op.operationType === "compra") {
      acc[op.assetType] = (acc[op.assetType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const uniqueAssets = new Set(operations.map(op => op.assetName.toUpperCase())).size;

  // Monthly evolution
  const monthlyData = operations
    .sort((a, b) => new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime())
    .reduce((acc, op) => {
      const date = new Date(op.operationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: monthKey, 
          totalInvested: 0, 
          totalIncome: 0,
          operationsCount: 0 
        };
      }

      const quantity = parseFloat(op.quantity);
      const price = parseFloat(op.unitPrice);
      const fees = parseFloat(op.fees || "0");
      const operationValue = quantity * price + fees;

      if (op.operationType === "compra") {
        acc[monthKey].totalInvested += operationValue;
      } else if (op.operationType === "venda") {
        acc[monthKey].totalInvested -= operationValue;
      } else if (op.operationType === "rendimento") {
        acc[monthKey].totalIncome += operationValue;
      }
      acc[monthKey].operationsCount += 1;

      return acc;
    }, {} as Record<string, { month: string; totalInvested: number; totalIncome: number; operationsCount: number }>);

  // Calculate cumulative values
  let cumulativeInvested = 0;
  let cumulativeIncome = 0;
  const monthlyEvolution = Object.values(monthlyData).map(month => {
    cumulativeInvested += month.totalInvested;
    cumulativeIncome += month.totalIncome;
    
    // Para o MVP, total patrimônio = total investido (sem cotação atual dos ativos)
    const totalPatrimony = Math.max(0, cumulativeInvested);
    
    return {
      month: month.month,
      totalInvested: Math.max(0, cumulativeInvested),
      totalPatrimony: totalPatrimony,
      accumulatedIncome: cumulativeIncome,
      operationsCount: month.operationsCount,
    };
  });

  return {
    totalInvested: Math.max(0, totalInvested),
    totalAssets: uniqueAssets,
    totalOperations: operations.length,
    assetsByType,
    monthlyEvolution,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}