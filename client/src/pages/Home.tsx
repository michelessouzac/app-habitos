import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type DrinkType = "Água" | "Café" | "Suco" | "Chá";

const DRINK_TYPES: Array<{ name: DrinkType; emoji: string; color: string }> = [
  { name: "Água", emoji: "💧", color: "from-blue-200 to-blue-100" },
  { name: "Café", emoji: "☕", color: "from-amber-200 to-amber-100" },
  { name: "Suco", emoji: "🧃", color: "from-orange-200 to-orange-100" },
  { name: "Chá", emoji: "🍵", color: "from-green-200 to-green-100" },
];

const styles = {
  foreground: "hsl(280, 20%, 20%)",
  mutedForeground: "hsl(280, 10%, 50%)",
  primary: "hsl(330, 100%, 71%)",
  card: "hsl(0, 0%, 100%)",
  border: "hsl(330, 80%, 90%)",
  bg: "linear-gradient(135deg, hsl(280, 100%, 97%), hsl(270, 80%, 95%), hsl(150, 50%, 92%))",
};

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedDrink, setSelectedDrink] = useState<DrinkType>("Água");
  const [quantity, setQuantity] = useState(250);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(2000);

  // Fetch today's hydration data
  const { data: hydrationData, isLoading: dataLoading, refetch } = trpc.hydration.getTodayData.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const addLogMutation = trpc.hydration.addLog.useMutation({
    onSuccess: () => {
      refetch();
      setQuantity(250);
      toast.success("Registro salvo com sucesso! 💧");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar: ${error.message}`);
    },
  });

  const updateGoalMutation = trpc.hydration.updateGoal.useMutation({
    onSuccess: () => {
      refetch();
      setEditingGoal(false);
      toast.success("Meta atualizada! 🎯");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar meta: ${error.message}`);
    },
  });

  // Initialize goal when data loads
  useEffect(() => {
    if (hydrationData?.goal) {
      setNewGoal(hydrationData.goal);
    }
  }, [hydrationData?.goal]);

  const handleRegisterIntake = () => {
    if (!selectedDrink || quantity <= 0 || quantity % 50 !== 0) {
      toast.error("Selecione uma bebida e quantidade válida (múltiplo de 50ml)");
      return;
    }
    addLogMutation.mutate({ drinkType: selectedDrink, amountMl: quantity });
  };

  const handleUpdateGoal = () => {
    if (newGoal <= 0) {
      toast.error("Meta deve ser maior que 0");
      return;
    }
    updateGoalMutation.mutate({ goalMl: newGoal });
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: styles.bg,
        }}
      >
        <Loader2 style={{ width: 32, height: 32, color: styles.primary }} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: styles.bg,
          padding: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2.25rem", fontStyle: "italic", color: styles.foreground, marginBottom: 8 }}>
            Meu Cantinho da Hidratação
          </h1>
          <p style={{ fontSize: "1.125rem", color: styles.mutedForeground, marginBottom: 32 }}>
            Acompanhe seu consumo de líquidos com elegância e tranquilidade
          </p>
        </div>
        <a href={getLoginUrl()}>
          <Button size="lg" style={{ backgroundColor: styles.primary, color: "white" }} className="rounded-full">
            Entrar com Manus
          </Button>
        </a>
      </div>
    );
  }

  const totalMl = hydrationData?.totalMl || 0;
  const goal = hydrationData?.goal || 2000;
  const percentage = Math.round((totalMl / goal) * 100);
  const logs = hydrationData?.logs || [];

  return (
    <div style={{ minHeight: "100vh", background: styles.bg, padding: 32 }}>
      <div style={{ maxWidth: 448, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.875rem", fontStyle: "italic", color: styles.foreground, marginBottom: 8 }}>
            Meu Cantinho da Hidratação
          </h1>
          <p style={{ fontSize: "0.875rem", color: styles.mutedForeground }}>Bem-vindo, {user?.name}!</p>
        </div>

        {/* Meta Diária */}
        <Card
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            borderRadius: 24,
            border: `1px solid ${styles.border}`,
            backgroundColor: styles.card,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: styles.mutedForeground }}>
              Meta do Dia
            </p>
            <p style={{ fontSize: "1.5rem", fontStyle: "italic", fontWeight: 600, color: styles.foreground }}>
              {goal} ml
            </p>
          </div>
          {!editingGoal ? (
            <Button variant="outline" size="sm" onClick={() => setEditingGoal(true)} className="rounded-full">
              Editar
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(parseInt(e.target.value) || 0)}
                style={{ height: 32, width: 80, borderRadius: 20, textAlign: "center" }}
              />
              <Button
                size="sm"
                onClick={handleUpdateGoal}
                disabled={updateGoalMutation.isPending}
                className="rounded-full"
              >
                Salvar
              </Button>
            </div>
          )}
        </Card>

        {/* Círculo de Progresso */}
        <Card
          style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            border: `1px solid ${styles.border}`,
            backgroundColor: styles.card,
            padding: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ position: "relative", marginBottom: 24, display: "flex", width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
            {/* Círculo de progresso */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 160 160">
              {/* Fundo do círculo */}
              <circle cx="80" cy="80" r="75" fill="none" stroke={styles.border} strokeWidth="8" />
              {/* Progresso */}
              <circle
                cx="80"
                cy="80"
                r="75"
                fill="none"
                stroke={styles.primary}
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 471} 471`}
                strokeLinecap="round"
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  transition: "stroke-dasharray 0.5s ease",
                }}
              />
            </svg>

            {/* Conteúdo do círculo */}
            <div style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <p style={{ fontSize: "2.25rem", fontWeight: 700, fontStyle: "italic", color: styles.foreground }}>
                {totalMl}
              </p>
              <p style={{ fontSize: "0.75rem", color: styles.mutedForeground }}>
                de {goal} ml
              </p>
              <p style={{ marginTop: 4, fontSize: "0.875rem", fontWeight: 600, color: styles.primary }}>
                {percentage}%
              </p>
            </div>
          </div>
        </Card>

        {/* Seleção de Bebida */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ marginBottom: 12, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: styles.mutedForeground }}>
            O que você bebeu?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {DRINK_TYPES.map((drink) => (
              <button
                key={drink.name}
                onClick={() => setSelectedDrink(drink.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 16,
                  border: `2px solid ${selectedDrink === drink.name ? styles.primary : styles.border}`,
                  padding: 12,
                  backgroundColor: selectedDrink === drink.name ? "rgba(255, 183, 202, 0.1)" : styles.card,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                type="button"
              >
                <span style={{ fontSize: "1.5rem" }}>{drink.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: styles.foreground }}>
                  {drink.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controle de Quantidade */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ marginBottom: 12, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: styles.mutedForeground }}>
            Quantidade
          </p>
          <Card
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              borderRadius: 24,
              border: `1px solid ${styles.border}`,
              backgroundColor: styles.card,
              padding: 24,
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(50, quantity - 50))}
              style={{ width: 40, height: 40, borderRadius: 20, padding: 0 }}
            >
              −
            </Button>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: 600, color: styles.foreground }}>
                {quantity}
              </p>
              <p style={{ fontSize: "0.75rem", color: styles.mutedForeground }}>ml</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.min(2000, quantity + 50))}
              style={{ width: 40, height: 40, borderRadius: 20, padding: 0 }}
            >
              +
            </Button>
          </Card>
        </div>

        {/* Botão Registrar */}
        <Button
          onClick={handleRegisterIntake}
          disabled={addLogMutation.isPending || dataLoading}
          style={{
            width: "100%",
            marginBottom: 32,
            borderRadius: 20,
            backgroundColor: styles.primary,
            color: "white",
            padding: "24px 16px",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {addLogMutation.isPending ? (
            <>
              <Loader2 style={{ marginRight: 8, width: 16, height: 16 }} className="animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar Momentinho"
          )}
        </Button>

        {/* Histórico */}
        <div>
          <p style={{ marginBottom: 12, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: styles.mutedForeground }}>
            Histórico de Hoje
          </p>
          <div style={{ maxHeight: 256, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.length === 0 ? (
              <Card
                style={{
                  borderRadius: 24,
                  border: `1px solid ${styles.border}`,
                  backgroundColor: styles.card,
                  padding: 32,
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: styles.mutedForeground }}>
                  Nenhum registro ainda hoje. ✨
                </p>
              </Card>
            ) : (
              logs.map((log) => (
                <Card
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 24,
                    border: `1px solid ${styles.border}`,
                    backgroundColor: styles.card,
                    padding: 16,
                    animation: "fadeIn 0.3s ease-out",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "1.5rem" }}>
                      {DRINK_TYPES.find((d) => d.name === log.drinkType)?.emoji || "💧"}
                    </span>
                    <div>
                      <p style={{ fontWeight: 500, color: styles.foreground }}>
                        {log.drinkType}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: styles.mutedForeground }}>
                        {new Date(log.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 600, color: styles.primary }}>
                    {log.amountMl} ml
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
