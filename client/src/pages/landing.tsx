import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Shield, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartLine className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Portfolio Manager</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Controle Manual Inteligente
            <br />
            <span className="text-primary">de Ativos</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Registre manualmente todas as suas operações de investimento e 
            acompanhe a evolução do seu patrimônio com cálculos automáticos de rentabilidade.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Começar Agora
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Cálculos Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Total investido, rentabilidade e evolução patrimonial calculados automaticamente 
                a partir das suas operações.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ChartLine className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Dashboard Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize a evolução do seu portfólio com gráficos e métricas detalhadas 
                por ativo e tipo de investimento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Controle Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Registre operações de ações, FIIs, fundos, renda fixa e criptomoedas 
                com controle completo dos seus dados.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-8">
              <Users className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">
                Pronto para começar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Faça login e comece a registrar suas operações de investimento hoje mesmo.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login-cta"
              >
                Entrar na Plataforma
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}